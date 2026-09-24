"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Trash2, Video, TriangleAlert, Users } from "lucide-react";
import { formatDateTime, toZonedInputValue, zonedLocalToUtc } from "@/lib/datetime";

export type SessionRow = {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string | null;
  startsAt: string;
  timezone: string;
  teamsLink: string | null;
  seatsTotal: number;
  booked: number;
  status: string;
  notes: string | null;
};

const STATUSES = ["OPEN", "SCHEDULED", "FULL", "COMPLETED", "CANCELLED"] as const;

export default function SessionsManager({
  courses,
  sessions,
}: {
  courses: { id: string; title: string; maxAttendees: number }[];
  sessions: SessionRow[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const [draft, setDraft] = useState({
    courseId: courses[0]?.id ?? "",
    title: "",
    startsAt: "",
    timezone: "Asia/Amman",
    teamsLink: "",
    seatsTotal: courses[0]?.maxAttendees ?? 15,
    status: "OPEN" as (typeof STATUSES)[number],
    notes: "",
  });

  async function create(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    // The time Rand types is wall-clock time in the session's own timezone,
    // not in whatever zone her device happens to be set to.
    const startsAt = zonedLocalToUtc(draft.startsAt, draft.timezone);
    if (Number.isNaN(startsAt.getTime())) {
      setError("That start time or timezone is not valid.");
      return;
    }
    setBusy("new");
    const res = await fetch("/api/admin/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...draft, startsAt: startsAt.toISOString() }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) {
      setError(json?.error || "Could not create that live date.");
      return;
    }
    setCreating(false);
    setDraft((d) => ({ ...d, title: "", startsAt: "", teamsLink: "", notes: "" }));
    router.refresh();
  }

  async function patch(id: string, data: Record<string, unknown>) {
    setBusy(id);
    const res = await fetch(`/api/admin/sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) {
      window.alert(json?.error || "Could not save.");
      return;
    }
    router.refresh();
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this live date?")) return;
    setBusy(id);
    const res = await fetch(`/api/admin/sessions/${id}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) {
      window.alert(json?.error || "Could not delete.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {!creating ? (
        <button
          type="button"
          onClick={() => setCreating(true)}
          disabled={courses.length === 0}
          className="btn-gold !py-2.5 !text-[0.82rem] disabled:opacity-40"
        >
          <Plus className="h-4 w-4" strokeWidth={2.2} />
          Schedule a live date
        </button>
      ) : (
        <form onSubmit={create} className="rounded-2xl border border-gold/45 bg-gold/[0.06] p-6">
          <h2 className="font-display text-xl font-semibold text-abyss">New live date</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label>
              <span className="field-label">Workshop *</span>
              <select
                required
                value={draft.courseId}
                onChange={(e) => {
                  const course = courses.find((c) => c.id === e.target.value);
                  setDraft((d) => ({
                    ...d,
                    courseId: e.target.value,
                    seatsTotal: course?.maxAttendees ?? d.seatsTotal,
                  }));
                }}
                className="field"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="field-label">Cohort label</span>
              <input
                value={draft.title}
                placeholder="Open cohort — Spring"
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                className="field"
              />
            </label>
            <label>
              <span className="field-label">Starts at — in the timezone beside it *</span>
              <input
                required
                type="datetime-local"
                value={draft.startsAt}
                onChange={(e) => setDraft((d) => ({ ...d, startsAt: e.target.value }))}
                className="field"
              />
            </label>
            <label>
              <span className="field-label">Timezone</span>
              <input
                value={draft.timezone}
                dir="ltr"
                onChange={(e) => setDraft((d) => ({ ...d, timezone: e.target.value }))}
                className="field"
              />
            </label>
            <label>
              <span className="field-label">Seats</span>
              <input
                type="number"
                min={1}
                value={draft.seatsTotal}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, seatsTotal: Number(e.target.value) || 1 }))
                }
                className="field"
              />
            </label>
            <label>
              <span className="field-label">Status</span>
              <select
                value={draft.status}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, status: e.target.value as (typeof STATUSES)[number] }))
                }
                className="field"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.toLowerCase()}
                  </option>
                ))}
              </select>
            </label>
            <label className="sm:col-span-2 lg:col-span-3">
              <span className="field-label">Microsoft Teams link</span>
              <input
                value={draft.teamsLink}
                dir="ltr"
                placeholder="https://teams.microsoft.com/l/meetup-join/…"
                onChange={(e) => setDraft((d) => ({ ...d, teamsLink: e.target.value }))}
                className="field"
              />
            </label>
          </div>

          {error && (
            <p className="mt-4 flex items-center gap-2 text-[0.82rem] text-ember">
              <TriangleAlert className="h-4 w-4 shrink-0" strokeWidth={1.9} />
              {error}
            </p>
          )}

          <div className="mt-5 flex gap-3">
            <button type="submit" disabled={busy === "new"} className="btn-gold !py-2.5 !text-[0.82rem]">
              <Save className="h-4 w-4" strokeWidth={1.9} />
              {busy === "new" ? "Saving…" : "Create"}
            </button>
            <button type="button" onClick={() => setCreating(false)} className="btn-outline !py-2.5 !text-[0.82rem]">
              Cancel
            </button>
          </div>
        </form>
      )}

      <ul className="space-y-4">
        {sessions.map((s) => (
          <li key={s.id} className="rounded-2xl border border-dune bg-parchment p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-display text-lg font-semibold text-abyss">
                  {formatDateTime(s.startsAt, s.timezone)}
                </p>
                <p className="mt-0.5 text-[0.84rem] text-teal">{s.courseTitle}</p>
                {s.title && <p className="mt-0.5 text-[0.8rem] text-slate-ink">{s.title}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-dune bg-cream px-3 py-1.5 text-[0.74rem] tabular-nums text-slate-ink">
                  <Users className="h-3.5 w-3.5 text-teal" strokeWidth={1.8} />
                  {s.booked}/{s.seatsTotal}
                </span>
                <button
                  type="button"
                  onClick={() => remove(s.id)}
                  disabled={busy === s.id}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-dune text-slate-ink transition-colors hover:border-ember hover:bg-ember/10 hover:text-ember"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[13rem_1fr_7rem_9rem]">
              <label>
                <span className="field-label">Starts at ({s.timezone})</span>
                <input
                  type="datetime-local"
                  defaultValue={toZonedInputValue(s.startsAt, s.timezone)}
                  onBlur={(e) => {
                    if (!e.target.value || e.target.value === toZonedInputValue(s.startsAt, s.timezone)) return;
                    const next = zonedLocalToUtc(e.target.value, s.timezone);
                    if (!Number.isNaN(next.getTime())) void patch(s.id, { startsAt: next.toISOString() });
                  }}
                  className="field"
                />
              </label>
              <label>
                <span className="field-label">Teams link</span>
                <input
                  defaultValue={s.teamsLink ?? ""}
                  dir="ltr"
                  placeholder="https://teams.microsoft.com/l/meetup-join/…"
                  onBlur={(e) => {
                    if (e.target.value !== (s.teamsLink ?? "")) {
                      void patch(s.id, { teamsLink: e.target.value });
                    }
                  }}
                  className="field"
                />
              </label>
              <label>
                <span className="field-label">Seats</span>
                <input
                  type="number"
                  min={1}
                  defaultValue={s.seatsTotal}
                  onBlur={(e) => {
                    const next = Number(e.target.value) || 1;
                    if (next !== s.seatsTotal) void patch(s.id, { seatsTotal: next });
                  }}
                  className="field"
                />
              </label>
              <label>
                <span className="field-label">Status</span>
                <select
                  defaultValue={s.status}
                  onChange={(e) => patch(s.id, { status: e.target.value })}
                  className="field"
                >
                  {STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st.toLowerCase()}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {!s.teamsLink && (
              <p className="mt-3 flex items-center gap-2 rounded-lg border border-ember/40 bg-ember/8 px-3.5 py-2.5 text-[0.78rem] text-abyss">
                <Video className="h-3.5 w-3.5 shrink-0 text-ember" strokeWidth={1.9} />
                No Teams link yet — paid attendees will see “to be announced” until you add one.
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
