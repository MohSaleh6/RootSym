import Link from "next/link";
import { headers } from "next/headers";
import { CircleAlert, CircleCheck, CircleX, TriangleAlert } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getPaymentDetails, hasPaymentDetails } from "@/lib/payments";
import { googleEnabled } from "@/lib/google-oauth";
import { AdminTitle, Card } from "../ui";

export const dynamic = "force-dynamic";

export const metadata = { title: "Readiness" };

/**
 * A single page that answers "is the live site actually able to take a
 * booking right now?".
 *
 * Every check catches its own errors, because the page has to stay readable
 * exactly when something is broken — in particular when the database is
 * unreachable, which is the failure that makes every other admin page throw.
 * Admin sign-in is checked against environment variables rather than the
 * database, so this page is still reachable then.
 *
 * Nothing here prints a secret: only whether a value is present.
 */

type Level = "ok" | "warn" | "blocked";

type Check = {
  label: string;
  level: Level;
  detail: string;
  /** What to do about it, shown only when the check is not ok. */
  fix?: string;
  href?: string;
};

/**
 * A readable one-liner for whatever the driver threw, with anything
 * password-shaped removed.
 *
 * Not every rejection is an Error: Neon's WebSocket driver rejects with an
 * ErrorEvent, whose String() is the useless "[object ErrorEvent]", so unwrap
 * the shapes that actually turn up before giving up on one.
 */
function safeMessage(error: unknown): string {
  const seen = new Set<unknown>();

  function unwrap(value: unknown, depth = 0): string | null {
    if (value == null || depth > 4 || seen.has(value)) return null;
    if (typeof value === "string") return value.trim() || null;
    if (typeof value !== "object") return String(value);
    seen.add(value);

    const record = value as Record<string, unknown>;
    for (const key of ["message", "error", "cause", "reason"]) {
      const nested = unwrap(record[key], depth + 1);
      if (nested) return nested;
    }
    // An ErrorEvent that carries nothing but its type still names the failure.
    return typeof record.type === "string" ? `Connection ${record.type}` : null;
  }

  const raw = unwrap(error) ?? "The database did not answer.";
  return raw.replace(/\/\/[^@\s]*@/g, "//***@").slice(0, 300);
}

/** The database host, so a worker pointed at the wrong database is obvious. */
function databaseHost(): string | null {
  try {
    return new URL(process.env.DATABASE_URL ?? "").hostname || null;
  } catch {
    return null;
  }
}

async function databaseCheck(): Promise<{ check: Check; up: boolean }> {
  if (!process.env.DATABASE_URL) {
    return {
      up: false,
      check: {
        label: "Database",
        level: "blocked",
        detail: "DATABASE_URL is not set on the deployed worker.",
        fix: "Cloudflare → Settings → Variables and Secrets. Add it as a Secret, not a Variable: plain variables are overwritten from wrangler.jsonc on the next deploy.",
      },
    };
  }
  const host = databaseHost();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      up: true,
      check: {
        label: "Database",
        level: "ok",
        detail: host ? `Connected to ${host}.` : "Connected.",
      },
    };
  } catch (error) {
    const local = host === "localhost" || host === "127.0.0.1";
    return {
      up: false,
      check: {
        label: "Database",
        level: "blocked",
        detail: `${host ? `${host}: ` : ""}${safeMessage(error)}`,
        fix: local
          ? "DATABASE_URL points at this machine, which a deployed worker cannot reach. Set it to the pooled Neon connection string."
          : "Check that DATABASE_URL is the pooled Neon connection string and that the Neon project is not suspended.",
      },
    };
  }
}

function adminCheck(): Check {
  const secret = process.env.AUTH_SECRET ?? "";
  const hasPassword = Boolean(process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD_HASH);
  if (!process.env.ADMIN_EMAIL || !hasPassword) {
    return {
      label: "Admin sign-in",
      level: "blocked",
      detail: "ADMIN_EMAIL or the admin password is missing.",
      fix: "Set both as runtime Secrets. Until then this session is the only way in.",
    };
  }
  if (secret.length < 24) {
    return {
      label: "Admin sign-in",
      level: "blocked",
      detail: "AUTH_SECRET is missing or shorter than 24 characters.",
      fix: "Generate one with: openssl rand -base64 48",
    };
  }
  return { label: "Admin sign-in", level: "ok", detail: "Credentials and session secret are set." };
}

function emailCheck(): Check {
  if (!process.env.RESEND_API_KEY) {
    return {
      label: "Email",
      level: "warn",
      detail: "No RESEND_API_KEY — emails are written to the worker log instead of being sent.",
      fix: "Bookings still work: every joining link can be copied from the Bookings page and sent by hand.",
      href: "/admin/enrollments",
    };
  }
  const from = process.env.MAIL_FROM ?? "";
  if (from.includes("resend.dev")) {
    return {
      label: "Email",
      level: "warn",
      detail: `Sending from ${from}, which only delivers to your own Resend account address.`,
      fix: "Verify a domain in Resend and point MAIL_FROM at it, otherwise customers never receive their joining link.",
    };
  }
  return { label: "Email", level: "ok", detail: from ? `Sending as ${from}.` : "Resend is configured." };
}

function googleCheck(): Check {
  return googleEnabled()
    ? { label: "Sign in with Google", level: "ok", detail: "Configured." }
    : {
        label: "Sign in with Google",
        level: "warn",
        detail: "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are not set, so the Google button is hidden.",
        fix: "Everything else works: people can still create an account with an email and a password.",
      };
}

export default async function HealthPage() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "unknown";

  const { check: database, up } = await databaseCheck();
  const checks: Check[] = [database, adminCheck(), emailCheck(), googleCheck()];

  if (up) {
    const [published, cohorts, awaiting, details] = await Promise.all([
      prisma.course.count({ where: { published: true } }).catch(() => -1),
      prisma.courseSession
        .findMany({
          where: { startsAt: { gte: new Date() }, status: "OPEN" },
          select: { id: true, teamsLink: true, course: { select: { teamsLink: true } } },
        })
        .catch(() => []),
      prisma.enrollment.count({ where: { status: "AWAITING_REVIEW" } }).catch(() => 0),
      getPaymentDetails(),
    ]);

    checks.push(
      published > 0
        ? {
            label: "Published workshops",
            level: "ok",
            detail: `${published} workshop${published === 1 ? "" : "s"} visible to the public.`,
          }
        : {
            label: "Published workshops",
            level: "blocked",
            detail: "Nothing is published, so the courses page is empty.",
            fix: "Open a workshop and switch Published on.",
            href: "/admin/courses",
          },
    );

    checks.push(
      hasPaymentDetails(details)
        ? {
            label: "Payment details",
            level: "ok",
            detail: details.cliqAlias
              ? `CliQ alias ${details.cliqAlias} is published on the payment page.`
              : "Bank details are published on the payment page.",
          }
        : {
            label: "Payment details",
            level: "blocked",
            detail: "No CliQ alias, IBAN or account number is saved.",
            fix: "Nobody can pay until at least one of these is filled in.",
            href: "/admin/settings",
          },
    );

    const missingLink = cohorts.filter((c) => !c.teamsLink && !c.course.teamsLink);
    checks.push(
      cohorts.length === 0
        ? {
            label: "Live dates",
            level: "warn",
            detail: "No open cohort in the future, so there is no date to book.",
            fix: "Add one from Live dates.",
            href: "/admin/sessions",
          }
        : missingLink.length > 0
          ? {
              label: "Live dates",
              level: "blocked",
              detail: `${missingLink.length} of ${cohorts.length} open cohort${cohorts.length === 1 ? "" : "s"} has no Microsoft Teams link.`,
              fix: "A paid attendee opening their joining link sees “link coming soon” instead of the meeting. The token is not spent, so adding the link later still works.",
              href: "/admin/sessions",
            }
          : {
              label: "Live dates",
              level: "ok",
              detail: `${cohorts.length} open cohort${cohorts.length === 1 ? "" : "s"}, each with a Teams link.`,
            },
    );

    if (awaiting > 0) {
      checks.push({
        label: "Transfers to review",
        level: "warn",
        detail: `${awaiting} booking${awaiting === 1 ? " says its transfer was" : "s say their transfers were"} sent.`,
        fix: "Confirm each one to release the joining link.",
        href: "/admin/enrollments",
      });
    }
  }

  const blocked = checks.filter((c) => c.level === "blocked").length;
  const warned = checks.filter((c) => c.level === "warn").length;

  return (
    <div className="space-y-8">
      <AdminTitle
        title="Readiness"
        subtitle={`Serving ${host} — everything a booking depends on, checked live.`}
      />

      <Card
        className={
          blocked > 0 ? "border-ember/40 bg-ember/5" : warned > 0 ? "border-gold/50 bg-gold/5" : ""
        }
      >
        <div className="flex items-start gap-4">
          {blocked > 0 ? (
            <CircleX className="mt-0.5 h-6 w-6 shrink-0 text-flame" strokeWidth={1.8} />
          ) : warned > 0 ? (
            <TriangleAlert className="mt-0.5 h-6 w-6 shrink-0 text-brass" strokeWidth={1.8} />
          ) : (
            <CircleCheck className="mt-0.5 h-6 w-6 shrink-0 text-teal" strokeWidth={1.8} />
          )}
          <div>
            <p className="font-display text-xl font-semibold text-abyss">
              {blocked > 0
                ? "The site cannot complete a booking"
                : warned > 0
                  ? "Bookings work, with things worth fixing"
                  : "Everything a booking needs is in place"}
            </p>
            <p className="mt-1 text-[0.9rem] text-slate-ink">
              {blocked > 0
                ? `${blocked} blocking item${blocked === 1 ? "" : "s"} below.`
                : warned > 0
                  ? `${warned} item${warned === 1 ? "" : "s"} to look at below.`
                  : "Nothing outstanding."}
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {checks.map((c) => (
          <Card key={c.label} className="flex items-start gap-4">
            {c.level === "ok" ? (
              <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal" strokeWidth={1.8} />
            ) : c.level === "warn" ? (
              <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-brass" strokeWidth={1.8} />
            ) : (
              <CircleX className="mt-0.5 h-5 w-5 shrink-0 text-flame" strokeWidth={1.8} />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[0.95rem] font-semibold text-abyss">{c.label}</p>
              <p className="mt-1 break-words text-[0.88rem] text-slate-ink">{c.detail}</p>
              {c.fix && <p className="mt-2 text-[0.84rem] text-slate-ink/85">{c.fix}</p>}
              {c.href && (
                <Link
                  href={c.href}
                  className="mt-3 inline-block text-[0.82rem] font-semibold text-teal underline underline-offset-4"
                >
                  Go there
                </Link>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
