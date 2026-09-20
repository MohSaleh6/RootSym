import { CircleCheck, CircleX } from "lucide-react";
import { getSetting } from "@/lib/enrollment";
import { stripeEnabled } from "@/lib/stripe";
import { AdminTitle, Card } from "../ui";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings" };

function Check({ ok, label, hint }: { ok: boolean; label: string; hint: string }) {
  return (
    <li className="flex items-start gap-3">
      {ok ? (
        <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-moss" strokeWidth={1.9} />
      ) : (
        <CircleX className="mt-0.5 h-4 w-4 shrink-0 text-ember" strokeWidth={1.9} />
      )}
      <span>
        <span className="block text-[0.88rem] font-semibold text-abyss">{label}</span>
        <span className="mt-0.5 block text-[0.8rem] leading-relaxed text-slate-ink">{hint}</span>
      </span>
    </li>
  );
}

export default async function AdminSettingsPage() {
  const [en, ar] = await Promise.all([
    getSetting("bank_transfer_instructions"),
    getSetting("bank_transfer_instructions_ar"),
  ]);

  const checks = [
    {
      ok: stripeEnabled(),
      label: "Card payments (Stripe)",
      hint: stripeEnabled()
        ? "STRIPE_SECRET_KEY is set — card checkout is live."
        : "Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to accept cards. Until then every booking uses bank transfer.",
    },
    {
      ok: Boolean(process.env.RESEND_API_KEY),
      label: "Transactional email (Resend)",
      hint: process.env.RESEND_API_KEY
        ? "Confirmation and joining-link emails are being delivered."
        : "Set RESEND_API_KEY and MAIL_FROM. Until then emails are only written to the server log — copy joining links from the Bookings page.",
    },
    {
      ok: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
      label: "Public site URL",
      hint: process.env.NEXT_PUBLIC_SITE_URL
        ? `Links are built from ${process.env.NEXT_PUBLIC_SITE_URL}`
        : "Set NEXT_PUBLIC_SITE_URL to your live domain so joining links point at the right place.",
    },
    {
      ok: Boolean(process.env.ADMIN_NOTIFY_EMAIL || process.env.ADMIN_EMAIL),
      label: "Admin notifications",
      hint: "You receive an email whenever a booking or a message arrives.",
    },
  ];

  return (
    <div className="space-y-8">
      <AdminTitle title="Settings" subtitle="Payment details and platform health." />

      <Card>
        <h2 className="font-display text-xl font-semibold text-abyss">Platform status</h2>
        <ul className="mt-5 space-y-4">
          {checks.map((c) => (
            <Check key={c.label} {...c} />
          ))}
        </ul>
      </Card>

      <SettingsForm
        initial={{ bank_transfer_instructions: en, bank_transfer_instructions_ar: ar }}
      />
    </div>
  );
}
