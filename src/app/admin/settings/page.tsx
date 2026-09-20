import { CircleCheck, CircleX, Info } from "lucide-react";
import { getPaymentDetails, hasPaymentDetails } from "@/lib/payments";
import { stripeEnabled } from "@/lib/stripe";
import { AdminTitle, Card } from "../ui";
import SettingsForm, { type PaymentFormValue } from "./SettingsForm";

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
  const details = await getPaymentDetails();

  const initial: PaymentFormValue = {
    pay_cliq_alias: details.cliqAlias,
    pay_cliq_name: details.cliqName,
    pay_bank_name: details.bankName,
    pay_account_name: details.accountName,
    pay_account_number: details.accountNumber,
    pay_iban: details.iban,
    pay_swift: details.swift,
    pay_notes: details.notes,
    pay_notes_ar: details.notesAr,
  };

  const checks = [
    {
      ok: hasPaymentDetails(details),
      label: "CliQ / bank transfer",
      hint: hasPaymentDetails(details)
        ? "Customers can see where to send the money and report their transfer."
        : "Add a CliQ alias or an IBAN below — this is how you actually get paid.",
    },
    {
      ok: Boolean(process.env.RESEND_API_KEY),
      label: "Transactional email (Resend)",
      hint: process.env.RESEND_API_KEY
        ? "Payment instructions and joining links are being delivered."
        : "Set RESEND_API_KEY and MAIL_FROM. Until then emails are only written to the server log — send payment details and joining links manually from the Bookings page.",
    },
    {
      ok: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
      label: "Public site URL",
      hint: process.env.NEXT_PUBLIC_SITE_URL
        ? `Links are built from ${process.env.NEXT_PUBLIC_SITE_URL}`
        : "Set NEXT_PUBLIC_SITE_URL to your live domain so payment and joining links point at the right place.",
    },
    {
      ok: Boolean(process.env.ADMIN_NOTIFY_EMAIL || process.env.ADMIN_EMAIL),
      label: "Admin notifications",
      hint: "You are emailed when a seat is held, when a customer reports a transfer, and when a message arrives.",
    },
  ];

  return (
    <div className="space-y-8">
      <AdminTitle title="Settings" subtitle="How you get paid, and platform health." />

      <Card>
        <h2 className="font-display text-xl font-semibold text-abyss">Platform status</h2>
        <ul className="mt-5 space-y-4">
          {checks.map((c) => (
            <Check key={c.label} {...c} />
          ))}
        </ul>

        {!stripeEnabled() && (
          <p className="mt-6 flex items-start gap-2.5 rounded-xl border border-dune bg-cream px-4 py-3 text-[0.8rem] leading-relaxed text-slate-ink">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-teal" strokeWidth={1.9} />
            Card payments are off. Stripe does not accept merchants based in Jordan, so the site
            runs on CliQ and bank transfer. If you later want to take cards — mainly useful for
            clients outside Jordan — see the options in docs/PAYMENTS.md.
          </p>
        )}
      </Card>

      <SettingsForm initial={initial} />
    </div>
  );
}
