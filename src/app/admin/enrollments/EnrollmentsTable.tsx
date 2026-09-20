"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Banknote,
  Check,
  Send,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  Copy,
  Search,
  X,
} from "lucide-react";
import { formatJod } from "@/lib/money";
import { Badge } from "../ui";

export type EnrollmentRow = {
  id: string;
  reference: string;
  courseTitle: string;
  sessionLabel: string | null;
  type: string;
  fullName: string;
  email: string;
  phone: string | null;
  organisation: string | null;
  jobTitle: string | null;
  attendees: number;
  amount: number;
  status: string;
  paymentMethod: string;
  message: string | null;
  adminNotes: string | null;
  transferReference: string | null;
  transferNote: string | null;
  holdExpiresAt: string | null;
  accessToken: string;
  accessOpenedAt: string | null;
  accessRevoked: boolean;
  accessResetCount: number;
  createdAt: string;
  siteUrl: string;
};

const FILTERS = ["ALL", "AWAITING_REVIEW", "PAID", "PENDING", "CANCELLED", "REFUNDED"] as const;

export default function EnrollmentsTable({ rows }: { rows: EnrollmentRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== "ALL" && r.status !== filter) return false;
      if (!q) return true;
      return [r.fullName, r.email, r.reference, r.courseTitle, r.organisation ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [rows, filter, query]);

  async function act(id: string, action: string, extra: Record<string, unknown> = {}) {
    setBusy(id + action);
    const res = await fetch(`/api/admin/enrollments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) {
      window.alert(json?.error || "That action failed.");
      return;
    }
    router.refresh();
  }

  async function copyLink(row: EnrollmentRow) {
    const url = `${row.siteUrl}/access/${row.accessToken}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(row.id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      window.prompt("Copy this joining link:", url);
    }
  }

  const dateFmt = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3.5 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.08em] transition-colors ${
                filter === f
                  ? "border-gold bg-gold/15 text-gold"
                  : "border-dune bg-parchment text-slate-ink hover:border-teal/50"
              }`}
            >
              {f.replace(/_/g, " ").toLowerCase()}
            </button>
          ))}
        </div>

        <label className="relative ms-auto min-w-[14rem] flex-1 sm:flex-none">
          <Search className="pointer-events-none absolute inset-y-0 start-3.5 my-auto h-4 w-4 text-slate-ink/50" strokeWidth={1.8} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, reference…"
            className="field !ps-10"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute inset-y-0 end-3 my-auto h-5 w-5 text-slate-ink/50 hover:text-ember"
              aria-label="Clear"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </label>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-dune bg-parchment/60 p-12 text-center text-[0.9rem] text-slate-ink">
          Nothing matches that filter.
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((r) => {
            const isOpen = open === r.id;
            return (
              <li key={r.id} className="overflow-hidden rounded-2xl border border-dune bg-parchment">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : r.id)}
                  className="flex w-full flex-wrap items-center gap-4 px-5 py-4 text-start transition-colors hover:bg-sand/40"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.94rem] font-semibold text-abyss">
                      {r.fullName}
                      {r.organisation && (
                        <span className="font-normal text-slate-ink"> · {r.organisation}</span>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-[0.78rem] text-slate-ink">
                      {r.courseTitle} · {r.attendees} attendee{r.attendees > 1 ? "s" : ""}
                    </span>
                  </span>

                  <span className="font-mono text-[0.74rem] text-slate-ink/70" dir="ltr">
                    {r.reference}
                  </span>
                  <span className="text-[0.86rem] font-semibold tabular-nums text-abyss">
                    {formatJod(r.amount)}
                  </span>
                  {r.transferReference && r.status === "AWAITING_REVIEW" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/50 bg-gold/12 px-2.5 py-1 text-[0.64rem] font-semibold text-gold">
                      <Banknote className="h-3 w-3" strokeWidth={2.2} />
                      transfer reported
                    </span>
                  )}
                  <Badge value={r.status} />
                  <ChevronDown
                    className={`h-4 w-4 text-slate-ink transition-transform duration-400 ${isOpen ? "rotate-180" : ""}`}
                    strokeWidth={2}
                  />
                </button>

                <div
                  className="grid transition-[grid-template-rows] duration-500 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-dune px-5 py-5">
                      <dl className="grid gap-x-8 gap-y-3 text-[0.84rem] sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-slate-ink/60">Email</dt>
                          <dd className="mt-1 break-all text-abyss" dir="ltr">{r.email}</dd>
                        </div>
                        {r.phone && (
                          <div>
                            <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-slate-ink/60">Phone</dt>
                            <dd className="mt-1 text-abyss" dir="ltr">{r.phone}</dd>
                          </div>
                        )}
                        {r.jobTitle && (
                          <div>
                            <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-slate-ink/60">Job title</dt>
                            <dd className="mt-1 text-abyss">{r.jobTitle}</dd>
                          </div>
                        )}
                        <div>
                          <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-slate-ink/60">Booking type</dt>
                          <dd className="mt-1 text-abyss">{r.type.toLowerCase()}</dd>
                        </div>
                        <div>
                          <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-slate-ink/60">Payment</dt>
                          <dd className="mt-1 text-abyss">{r.paymentMethod.replace("_", " ").toLowerCase()}</dd>
                        </div>
                        <div>
                          <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-slate-ink/60">Booked</dt>
                          <dd className="mt-1 text-abyss">{dateFmt.format(new Date(r.createdAt))}</dd>
                        </div>
                        <div>
                          <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-slate-ink/60">Live date</dt>
                          <dd className="mt-1 text-abyss">{r.sessionLabel ?? "Next available cohort"}</dd>
                        </div>
                        {r.holdExpiresAt && r.status !== "PAID" && (
                          <div>
                            <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-slate-ink/60">Seat held until</dt>
                            <dd
                              className={`mt-1 ${
                                new Date(r.holdExpiresAt) < new Date() ? "text-ember" : "text-abyss"
                              }`}
                            >
                              {dateFmt.format(new Date(r.holdExpiresAt))}
                              {new Date(r.holdExpiresAt) < new Date() && " — expired"}
                            </dd>
                          </div>
                        )}
                        <div>
                          <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-slate-ink/60">Joining link</dt>
                          <dd className="mt-1 text-abyss">
                            {r.accessRevoked
                              ? "revoked"
                              : r.accessOpenedAt
                                ? `opened ${dateFmt.format(new Date(r.accessOpenedAt))}`
                                : "unused"}
                            {r.accessResetCount > 0 && ` · reissued ${r.accessResetCount}×`}
                          </dd>
                        </div>
                      </dl>

                      {r.transferReference && (
                        <div className="mt-4 rounded-xl border border-gold/45 bg-gold/8 p-4">
                          <p className="flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-ember">
                            <Banknote className="h-3.5 w-3.5" strokeWidth={2} />
                            Transfer reported by the customer
                          </p>
                          <p className="mt-2 font-mono text-[0.95rem] font-semibold text-abyss" dir="ltr">
                            {r.transferReference}
                          </p>
                          {r.transferNote && (
                            <p className="mt-2 whitespace-pre-line text-[0.84rem] leading-relaxed text-slate-ink">
                              {r.transferNote}
                            </p>
                          )}
                          <p className="mt-2.5 text-[0.76rem] text-slate-ink/75">
                            Check the account for {formatJod(r.amount)}, then approve below.
                          </p>
                        </div>
                      )}

                      {r.message && (
                        <div className="mt-4 rounded-xl border border-dune bg-cream p-4">
                          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-slate-ink/60">
                            Their note
                          </p>
                          <p className="mt-1.5 whitespace-pre-line text-[0.86rem] leading-relaxed text-slate-ink">
                            {r.message}
                          </p>
                        </div>
                      )}

                      <div className="mt-5 flex flex-wrap gap-2">
                        {r.status !== "PAID" && (
                          <button
                            type="button"
                            onClick={() => act(r.id, "approve")}
                            disabled={busy === r.id + "approve"}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-leaf/50 bg-leaf/10 px-3.5 py-2 text-[0.76rem] font-semibold text-moss transition-colors hover:bg-leaf/20"
                          >
                            <Check className="h-3.5 w-3.5" strokeWidth={2.2} />
                            Mark paid & send link
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => act(r.id, "resend_link")}
                          disabled={busy === r.id + "resend_link"}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-dune px-3.5 py-2 text-[0.76rem] font-semibold text-teal transition-colors hover:border-gold hover:bg-gold/10"
                        >
                          <Send className="h-3.5 w-3.5 flip-x" strokeWidth={1.9} />
                          Resend email
                        </button>
                        <button
                          type="button"
                          onClick={() => act(r.id, "reset_access")}
                          disabled={busy === r.id + "reset_access"}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-dune px-3.5 py-2 text-[0.76rem] font-semibold text-teal transition-colors hover:border-gold hover:bg-gold/10"
                        >
                          <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.9} />
                          Issue a fresh link
                        </button>
                        <button
                          type="button"
                          onClick={() => copyLink(r)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-dune px-3.5 py-2 text-[0.76rem] font-semibold text-slate-ink transition-colors hover:border-teal hover:text-teal"
                        >
                          <Copy className="h-3.5 w-3.5" strokeWidth={1.9} />
                          {copied === r.id ? "Copied" : "Copy link"}
                        </button>
                        {r.accessRevoked ? (
                          <button
                            type="button"
                            onClick={() => act(r.id, "unrevoke")}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-dune px-3.5 py-2 text-[0.76rem] font-semibold text-moss transition-colors hover:border-leaf"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.9} />
                            Restore access
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => act(r.id, "revoke")}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-dune px-3.5 py-2 text-[0.76rem] font-semibold text-slate-ink transition-colors hover:border-ember hover:bg-ember/10 hover:text-ember"
                          >
                            <ShieldAlert className="h-3.5 w-3.5" strokeWidth={1.9} />
                            Revoke access
                          </button>
                        )}
                        {r.status !== "CANCELLED" && r.status !== "REFUNDED" && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm("Cancel this booking?")) act(r.id, "cancel");
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-dune px-3.5 py-2 text-[0.76rem] font-semibold text-slate-ink transition-colors hover:border-ember hover:text-ember"
                          >
                            <X className="h-3.5 w-3.5" strokeWidth={2.2} />
                            Cancel
                          </button>
                        )}
                      </div>

                      <label className="mt-5 block">
                        <span className="field-label">Private note</span>
                        <textarea
                          defaultValue={r.adminNotes ?? ""}
                          rows={2}
                          onBlur={(e) => {
                            if (e.target.value !== (r.adminNotes ?? "")) {
                              void act(r.id, "note", { adminNotes: e.target.value });
                            }
                          }}
                          className="field resize-y"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
