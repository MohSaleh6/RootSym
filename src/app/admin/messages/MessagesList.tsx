"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2, Mail, Reply } from "lucide-react";
import { formatAdminDateTime } from "@/lib/datetime";

export type MessageRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  organisation: string | null;
  subject: string;
  message: string;
  handled: boolean;
  createdAt: string;
};

export default function MessagesList({ rows }: { rows: MessageRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function toggle(id: string, handled: boolean) {
    setBusy(id);
    await fetch(`/api/admin/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handled }),
    });
    setBusy(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this message?")) return;
    setBusy(id);
    await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    setBusy(null);
    router.refresh();
  }


  return (
    <ul className="space-y-3">
      {rows.map((m) => (
        <li
          key={m.id}
          className={`rounded-2xl border p-5 transition-colors ${
            m.handled ? "border-dune bg-parchment/60 opacity-70" : "border-gold/40 bg-parchment"
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-display text-lg font-semibold text-abyss">{m.subject}</p>
              <p className="mt-1 text-[0.82rem] text-slate-ink">
                {m.name}
                {m.organisation && ` · ${m.organisation}`}
                {" · "}
                <span dir="ltr">{m.email}</span>
                {m.phone && (
                  <>
                    {" · "}
                    <span dir="ltr">{m.phone}</span>
                  </>
                )}
              </p>
            </div>
            <span className="font-mono text-[0.72rem] text-slate-ink/60">
              {formatAdminDateTime(m.createdAt)}
            </span>
          </div>

          <p className="mt-3.5 whitespace-pre-line rounded-xl border border-dune bg-cream p-4 text-[0.88rem] leading-relaxed text-slate-ink">
            {m.message}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + m.subject)}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-dune px-3.5 py-2 text-[0.76rem] font-semibold text-teal transition-colors hover:border-gold hover:bg-gold/10"
            >
              <Reply className="h-3.5 w-3.5 flip-x" strokeWidth={1.9} />
              Reply
            </a>
            <button
              type="button"
              onClick={() => toggle(m.id, !m.handled)}
              disabled={busy === m.id}
              className="inline-flex items-center gap-1.5 rounded-lg border border-dune px-3.5 py-2 text-[0.76rem] font-semibold text-slate-ink transition-colors hover:border-leaf hover:bg-leaf/10 hover:text-moss"
            >
              {m.handled ? (
                <>
                  <Mail className="h-3.5 w-3.5" strokeWidth={1.9} />
                  Mark unread
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" strokeWidth={2.2} />
                  Mark handled
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => remove(m.id)}
              disabled={busy === m.id}
              className="inline-flex items-center gap-1.5 rounded-lg border border-dune px-3.5 py-2 text-[0.76rem] font-semibold text-slate-ink transition-colors hover:border-ember hover:bg-ember/10 hover:text-ember"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.9} />
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
