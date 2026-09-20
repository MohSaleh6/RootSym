"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteCourseButton({
  id,
  title,
  disabled,
}: {
  id: string;
  title: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (disabled) return;
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/courses/${id}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      window.alert(json?.error || "Could not delete this workshop.");
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={busy || disabled}
      title={disabled ? "This workshop has bookings — unpublish it instead." : "Delete"}
      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-dune px-3.5 py-2 text-[0.76rem] font-semibold text-slate-ink transition-colors hover:border-ember hover:bg-ember/10 hover:text-ember disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.9} />
      Delete
    </button>
  );
}
