"use client";

import { useState } from "react";
import { Save, CircleCheck, TriangleAlert, Banknote, Info } from "lucide-react";

export type PaymentFormValue = {
  pay_cliq_alias: string;
  pay_cliq_name: string;
  pay_bank_name: string;
  pay_account_name: string;
  pay_account_number: string;
  pay_iban: string;
  pay_swift: string;
  pay_notes: string;
  pay_notes_ar: string;
};

const FIELDS: {
  key: keyof PaymentFormValue;
  label: string;
  hint?: string;
  placeholder?: string;
  wide?: boolean;
  rtl?: boolean;
  rows?: number;
}[] = [
  {
    key: "pay_cliq_alias",
    label: "CliQ alias",
    hint: "The alias customers send to — usually your mobile number or a name you registered with your bank.",
    placeholder: "RANDSALEH or 0790000000",
  },
  {
    key: "pay_cliq_name",
    label: "CliQ account name",
    hint: "Shown so the customer can check they are sending to the right person.",
    placeholder: "Rand Saleh",
  },
  { key: "pay_bank_name", label: "Bank name", placeholder: "Arab Bank" },
  { key: "pay_account_name", label: "Account name", placeholder: "Rand Ali Saleh" },
  { key: "pay_account_number", label: "Account number", placeholder: "0123456789" },
  { key: "pay_iban", label: "IBAN", placeholder: "JO00 ABCD 0000 0000 0000 0000 0000" },
  { key: "pay_swift", label: "SWIFT / BIC", hint: "Only needed for transfers from outside Jordan.", placeholder: "ARABJOAX" },
  {
    key: "pay_notes",
    label: "Extra notes (English)",
    hint: "Anything else the customer should know — cut-off times, who to contact, and so on.",
    wide: true,
    rows: 4,
  },
  {
    key: "pay_notes_ar",
    label: "Extra notes (Arabic)",
    wide: true,
    rows: 4,
    rtl: true,
  },
];

export default function SettingsForm({ initial }: { initial: PaymentFormValue }) {
  const [value, setValue] = useState(initial);
  const [state, setState] = useState<"idle" | "busy" | "saved" | "error">("idle");

  function set(key: keyof PaymentFormValue, v: string) {
    setValue((prev) => ({ ...prev, [key]: v }));
    setState("idle");
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setState("busy");
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    });
    setState(res.ok ? "saved" : "error");
  }

  const ready = Boolean(value.pay_cliq_alias || value.pay_iban || value.pay_account_number);

  return (
    <form onSubmit={save} className="space-y-5">
      <div className="rounded-2xl border border-dune bg-parchment p-6">
        <h2 className="flex items-center gap-2.5 font-display text-xl font-semibold text-abyss">
          <Banknote className="h-5 w-5 text-teal" strokeWidth={1.7} />
          Payment details
        </h2>
        <p className="mt-1.5 text-[0.84rem] leading-relaxed text-slate-ink">
          These are shown on the customer&apos;s payment page and sent in their confirmation email.
          Leave a field blank and it is simply not shown.
        </p>

        {!ready && (
          <p className="mt-4 flex items-start gap-2.5 rounded-xl border border-ember/40 bg-ember/8 px-4 py-3 text-[0.84rem] text-abyss">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-ember" strokeWidth={1.9} />
            Until you fill in at least a CliQ alias or an IBAN, customers are told the details are
            coming by email. Bookings still work — they are just held longer.
          </p>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <label key={f.key} className={f.wide ? "sm:col-span-2" : ""}>
              <span className="field-label">{f.label}</span>
              {f.rows ? (
                <textarea
                  rows={f.rows}
                  dir={f.rtl ? "rtl" : undefined}
                  value={value[f.key]}
                  placeholder={f.placeholder}
                  onChange={(e) => set(f.key, e.target.value)}
                  className="field resize-y"
                />
              ) : (
                <input
                  dir="ltr"
                  value={value[f.key]}
                  placeholder={f.placeholder}
                  onChange={(e) => set(f.key, e.target.value)}
                  className="field"
                />
              )}
              {f.hint && (
                <span className="mt-1.5 block text-[0.72rem] leading-relaxed text-slate-ink/70">
                  {f.hint}
                </span>
              )}
            </label>
          ))}
        </div>

        <p className="mt-6 flex items-start gap-2.5 rounded-xl border border-dune bg-cream px-4 py-3 text-[0.8rem] leading-relaxed text-slate-ink">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-teal" strokeWidth={1.9} />
          Every booking gets its own reference (RS-XXXX-XXXX). Customers are asked to put it in the
          transfer note, which is how you match a payment to a seat on the Bookings page.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={state === "busy"} className="btn-gold !py-2.5 !text-[0.84rem]">
          <Save className="h-4 w-4" strokeWidth={1.9} />
          {state === "busy" ? "Saving…" : "Save payment details"}
        </button>
        {state === "saved" && (
          <p className="flex items-center gap-2 text-[0.84rem] text-moss">
            <CircleCheck className="h-4 w-4" strokeWidth={1.9} />
            Saved.
          </p>
        )}
        {state === "error" && (
          <p className="flex items-center gap-2 text-[0.84rem] text-ember">
            <TriangleAlert className="h-4 w-4" strokeWidth={1.9} />
            Could not save.
          </p>
        )}
      </div>
    </form>
  );
}
