"use client";

import { useState } from "react";
import { Save, CircleCheck, TriangleAlert } from "lucide-react";

export default function SettingsForm({
  initial,
}: {
  initial: { bank_transfer_instructions: string; bank_transfer_instructions_ar: string };
}) {
  const [value, setValue] = useState(initial);
  const [state, setState] = useState<"idle" | "busy" | "saved" | "error">("idle");

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

  return (
    <form onSubmit={save} className="space-y-5">
      <div className="rounded-2xl border border-dune bg-parchment p-6">
        <h2 className="font-display text-xl font-semibold text-abyss">Bank transfer instructions</h2>
        <p className="mt-1.5 text-[0.84rem] leading-relaxed text-slate-ink">
          Sent by email to anyone who chooses “Bank transfer / CliQ” at checkout, and shown on their
          confirmation page. Put your real bank name, account name, IBAN and CliQ alias here.
        </p>

        <label className="mt-5 block">
          <span className="field-label">English</span>
          <textarea
            rows={8}
            value={value.bank_transfer_instructions}
            onChange={(e) =>
              setValue((v) => ({ ...v, bank_transfer_instructions: e.target.value }))
            }
            className="field resize-y font-mono text-[0.84rem]"
          />
        </label>

        <label className="mt-4 block">
          <span className="field-label">Arabic</span>
          <textarea
            rows={8}
            dir="rtl"
            value={value.bank_transfer_instructions_ar}
            onChange={(e) =>
              setValue((v) => ({ ...v, bank_transfer_instructions_ar: e.target.value }))
            }
            className="field resize-y text-[0.88rem]"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={state === "busy"} className="btn-gold !py-2.5 !text-[0.84rem]">
          <Save className="h-4 w-4" strokeWidth={1.9} />
          {state === "busy" ? "Saving…" : "Save settings"}
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
