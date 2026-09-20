"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Plus,
  Trash2,
  Save,
  Upload,
  TriangleAlert,
  CircleCheck,
  GripVertical,
  ImageIcon,
} from "lucide-react";
import { filsToJod, parseJodInput } from "@/lib/money";
import CourseIcon, { ICON_KEYS } from "@/components/CourseIcon";

export type CourseFormValue = {
  id?: string;
  slug: string;
  title: string;
  titleAr: string;
  tagline: string;
  taglineAr: string;
  summary: string;
  summaryAr: string;
  description: string;
  descriptionAr: string;
  imageUrl: string;
  durationHours: number;
  deliveryMode: string;
  level: string;
  languageOfDelivery: string;
  priceIndividual: number;
  priceCompany: number;
  maxAttendees: number;
  outcomes: string[];
  outcomesAr: string[];
  audience: string[];
  audienceAr: string[];
  tools: string[];
  modules: { clock?: string; title: string; titleAr?: string; points: string[]; pointsAr?: string[] }[];
  faqs: { q: string; a: string; qAr?: string; aAr?: string }[];
  teamsLink: string;
  accentColor: string;
  icon: string;
  featured: boolean;
  published: boolean;
  sortOrder: number;
};

export const EMPTY_COURSE: CourseFormValue = {
  slug: "",
  title: "",
  titleAr: "",
  tagline: "",
  taglineAr: "",
  summary: "",
  summaryAr: "",
  description: "",
  descriptionAr: "",
  imageUrl: "",
  durationHours: 8,
  deliveryMode: "Live on Microsoft Teams",
  level: "All levels",
  languageOfDelivery: "English (Arabic on request)",
  priceIndividual: 85_000,
  priceCompany: 900_000,
  maxAttendees: 15,
  outcomes: [""],
  outcomesAr: [],
  audience: [""],
  audienceAr: [],
  tools: [""],
  modules: [],
  faqs: [],
  teamsLink: "",
  accentColor: "#2e86ab",
  icon: "target",
  featured: false,
  published: true,
  sortOrder: 0,
};

/* ---------- small building blocks ---------- */

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-dune bg-parchment p-6">
      <h2 className="font-display text-xl font-semibold text-abyss">{title}</h2>
      {hint && <p className="mt-1 text-[0.82rem] text-slate-ink">{hint}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
  hint,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[0.72rem] text-slate-ink/70">{hint}</span>}
    </label>
  );
}

function ListEditor({
  label,
  values,
  onChange,
  placeholder,
  rtl = false,
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  rtl?: boolean;
}) {
  return (
    <div>
      <span className="field-label">{label}</span>
      <ul className="space-y-2">
        {values.map((value, i) => (
          <li key={i} className="flex items-start gap-2">
            <GripVertical className="mt-3 h-4 w-4 shrink-0 text-dune" strokeWidth={1.6} />
            <textarea
              value={value}
              dir={rtl ? "rtl" : "ltr"}
              rows={1}
              placeholder={placeholder}
              onChange={(e) => {
                const next = [...values];
                next[i] = e.target.value;
                onChange(next);
              }}
              className="field min-h-[2.75rem] resize-y py-2.5"
            />
            <button
              type="button"
              onClick={() => onChange(values.filter((_, j) => j !== i))}
              className="mt-1.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-dune text-slate-ink transition-colors hover:border-ember hover:bg-ember/10 hover:text-ember"
              aria-label="Remove"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => onChange([...values, ""])}
        className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-dune px-3.5 py-2 text-[0.76rem] font-semibold text-teal transition-colors hover:border-gold hover:bg-gold/10 hover:text-abyss"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
        Add
      </button>
    </div>
  );
}

/* ---------- the form ---------- */

export default function CourseForm({ initial }: { initial: CourseFormValue }) {
  const router = useRouter();
  const [value, setValue] = useState<CourseFormValue>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const isEdit = Boolean(initial.id);

  function set<K extends keyof CourseFormValue>(key: K, v: CourseFormValue[K]) {
    setValue((prev) => ({ ...prev, [key]: v }));
    setSaved(false);
  }

  function slugify(text: string) {
    return text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80);
  }

  async function upload(file: File) {
    setError(null);
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body });
    const json = await res.json();
    if (!res.ok) {
      setError(json?.error || "Upload failed.");
      return;
    }
    set("imageUrl", json.url);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    const payload = {
      ...value,
      outcomes: value.outcomes.map((s) => s.trim()).filter(Boolean),
      outcomesAr: value.outcomesAr.map((s) => s.trim()).filter(Boolean),
      audience: value.audience.map((s) => s.trim()).filter(Boolean),
      audienceAr: value.audienceAr.map((s) => s.trim()).filter(Boolean),
      tools: value.tools.map((s) => s.trim()).filter(Boolean),
      modules: value.modules
        .filter((m) => m.title.trim())
        .map((m) => ({
          ...m,
          points: (m.points ?? []).map((p) => p.trim()).filter(Boolean),
          pointsAr: (m.pointsAr ?? []).map((p) => p.trim()).filter(Boolean),
        })),
      faqs: value.faqs.filter((f) => f.q.trim() && f.a.trim()),
    };
    delete (payload as Partial<CourseFormValue>).id;

    try {
      const res = await fetch(
        isEdit ? `/api/admin/courses/${initial.id}` : "/api/admin/courses",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Could not save the workshop.");
        setBusy(false);
        return;
      }
      setSaved(true);
      setBusy(false);
      router.refresh();
      if (!isEdit) router.push(`/admin/courses/${json.course.id}`);
    } catch {
      setError("Could not reach the server.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 pb-28">
      {/* ---- identity ---- */}
      <Section title="Identity" hint="Everything a visitor reads first.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title (English) *">
            <input
              required
              value={value.title}
              onChange={(e) => {
                set("title", e.target.value);
                if (!isEdit && !value.slug) set("slug", slugify(e.target.value));
              }}
              className="field"
            />
          </Field>
          <Field label="Title (Arabic)">
            <input
              value={value.titleAr}
              dir="rtl"
              onChange={(e) => set("titleAr", e.target.value)}
              className="field"
            />
          </Field>

          <Field label="URL slug *" hint={`rootsym.com/courses/${value.slug || "…"}`}>
            <input
              required
              value={value.slug}
              onChange={(e) => set("slug", slugify(e.target.value))}
              className="field"
              dir="ltr"
            />
          </Field>
          <Field label="Sort order" hint="Lower numbers appear first.">
            <input
              type="number"
              min={0}
              value={value.sortOrder}
              onChange={(e) => set("sortOrder", Number(e.target.value) || 0)}
              className="field"
            />
          </Field>

          <Field label="Tagline (English) *">
            <input
              required
              value={value.tagline}
              onChange={(e) => set("tagline", e.target.value)}
              className="field"
            />
          </Field>
          <Field label="Tagline (Arabic)">
            <input
              value={value.taglineAr}
              dir="rtl"
              onChange={(e) => set("taglineAr", e.target.value)}
              className="field"
            />
          </Field>

          <Field label="Short summary (English) *" hint="Shown on cards and previews.">
            <textarea
              required
              rows={4}
              value={value.summary}
              onChange={(e) => set("summary", e.target.value)}
              className="field resize-y"
            />
          </Field>
          <Field label="Short summary (Arabic)">
            <textarea
              rows={4}
              dir="rtl"
              value={value.summaryAr}
              onChange={(e) => set("summaryAr", e.target.value)}
              className="field resize-y"
            />
          </Field>

          <Field
            label="Full description (English) *"
            hint="Leave a blank line between paragraphs."
            className="sm:col-span-2"
          >
            <textarea
              required
              rows={8}
              value={value.description}
              onChange={(e) => set("description", e.target.value)}
              className="field resize-y"
            />
          </Field>
          <Field label="Full description (Arabic)" className="sm:col-span-2">
            <textarea
              rows={8}
              dir="rtl"
              value={value.descriptionAr}
              onChange={(e) => set("descriptionAr", e.target.value)}
              className="field resize-y"
            />
          </Field>
        </div>
      </Section>

      {/* ---- look ---- */}
      <Section title="Cover & styling">
        <div className="grid gap-5 sm:grid-cols-[14rem_1fr]">
          <div>
            <span className="field-label">Cover image</span>
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-dune bg-sand">
              {value.imageUrl ? (
                <Image src={value.imageUrl} alt="" fill unoptimized className="object-cover" />
              ) : (
                <span className="flex h-full items-center justify-center text-slate-ink/50">
                  <ImageIcon className="h-7 w-7" strokeWidth={1.4} />
                </span>
              )}
            </div>
            <div className="mt-2.5 flex gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-dune px-3 py-2 text-[0.74rem] font-semibold text-teal transition-colors hover:border-gold hover:bg-gold/10"
              >
                <Upload className="h-3.5 w-3.5" strokeWidth={1.9} />
                Upload
              </button>
              {value.imageUrl && (
                <button
                  type="button"
                  onClick={() => set("imageUrl", "")}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-dune text-slate-ink transition-colors hover:border-ember hover:text-ember"
                  aria-label="Remove image"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload(file);
                e.target.value = "";
              }}
            />
          </div>

          <div className="space-y-4">
            <Field label="…or paste an image URL">
              <input
                value={value.imageUrl.startsWith("data:") ? "" : value.imageUrl}
                placeholder="https://…"
                dir="ltr"
                onChange={(e) => set("imageUrl", e.target.value)}
                className="field"
              />
            </Field>

            <Field label="Accent colour">
              <span className="flex items-center gap-3">
                <input
                  type="color"
                  value={value.accentColor}
                  onChange={(e) => set("accentColor", e.target.value)}
                  className="h-11 w-16 cursor-pointer rounded-lg border border-dune bg-parchment p-1"
                />
                <input
                  value={value.accentColor}
                  dir="ltr"
                  onChange={(e) => set("accentColor", e.target.value)}
                  className="field flex-1"
                />
              </span>
            </Field>

            <div>
              <span className="field-label">Icon</span>
              <div className="flex flex-wrap gap-2">
                {ICON_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => set("icon", key)}
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-300 ${
                      value.icon === key
                        ? "border-gold bg-gold/15 text-gold"
                        : "border-dune bg-cream text-slate-ink hover:border-teal/50"
                    }`}
                    aria-label={key}
                  >
                    <CourseIcon name={key} className="h-4.5 w-4.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ---- logistics ---- */}
      <Section title="Delivery & pricing">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Duration (hours) *">
            <input
              type="number"
              min={1}
              required
              value={value.durationHours}
              onChange={(e) => set("durationHours", Number(e.target.value) || 1)}
              className="field"
            />
          </Field>
          <Field label="Max attendees *">
            <input
              type="number"
              min={1}
              required
              value={value.maxAttendees}
              onChange={(e) => set("maxAttendees", Number(e.target.value) || 1)}
              className="field"
            />
          </Field>
          <Field label="Delivery mode *">
            <input
              required
              value={value.deliveryMode}
              onChange={(e) => set("deliveryMode", e.target.value)}
              className="field"
            />
          </Field>
          <Field label="Level *">
            <input
              required
              value={value.level}
              onChange={(e) => set("level", e.target.value)}
              className="field"
            />
          </Field>
          <Field label="Language of delivery *">
            <input
              required
              value={value.languageOfDelivery}
              onChange={(e) => set("languageOfDelivery", e.target.value)}
              className="field"
            />
          </Field>
          <Field
            label="Default Teams link"
            hint="Used when a booking has no specific live date. Per-date links override this."
          >
            <input
              value={value.teamsLink}
              dir="ltr"
              placeholder="https://teams.microsoft.com/l/meetup-join/…"
              onChange={(e) => set("teamsLink", e.target.value)}
              className="field"
            />
          </Field>

          <Field label="Individual price (JOD) *">
            <input
              type="number"
              step="0.5"
              min={0}
              required
              value={filsToJod(value.priceIndividual)}
              onChange={(e) => set("priceIndividual", parseJodInput(e.target.value))}
              className="field"
            />
          </Field>
          <Field label="Company price (JOD) *" hint="Flat price for the whole private room.">
            <input
              type="number"
              step="0.5"
              min={0}
              required
              value={filsToJod(value.priceCompany)}
              onChange={(e) => set("priceCompany", parseJodInput(e.target.value))}
              className="field"
            />
          </Field>

          <div className="flex flex-col justify-end gap-3">
            <label className="flex items-center gap-3 rounded-xl border border-dune bg-cream px-4 py-3">
              <input
                type="checkbox"
                checked={value.published}
                onChange={(e) => set("published", e.target.checked)}
                className="h-4 w-4 accent-[#c9a227]"
              />
              <span className="text-[0.86rem] font-medium text-abyss">Published</span>
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-dune bg-cream px-4 py-3">
              <input
                type="checkbox"
                checked={value.featured}
                onChange={(e) => set("featured", e.target.checked)}
                className="h-4 w-4 accent-[#c9a227]"
              />
              <span className="text-[0.86rem] font-medium text-abyss">Featured on the home page</span>
            </label>
          </div>
        </div>
      </Section>

      {/* ---- lists ---- */}
      <Section title="Outcomes, audience and tools">
        <div className="grid gap-6 lg:grid-cols-2">
          <ListEditor
            label="Learning outcomes (English)"
            values={value.outcomes}
            onChange={(v) => set("outcomes", v)}
            placeholder="What a participant will be able to do…"
          />
          <ListEditor
            label="Learning outcomes (Arabic)"
            values={value.outcomesAr}
            onChange={(v) => set("outcomesAr", v)}
            rtl
          />
          <ListEditor
            label="Who it is for (English)"
            values={value.audience}
            onChange={(v) => set("audience", v)}
          />
          <ListEditor
            label="Who it is for (Arabic)"
            values={value.audienceAr}
            onChange={(v) => set("audienceAr", v)}
            rtl
          />
          <ListEditor
            label="Tools covered"
            values={value.tools}
            onChange={(v) => set("tools", v)}
            placeholder="Five Whys, Pareto, A3…"
          />
        </div>
      </Section>

      {/* ---- modules ---- */}
      <Section title="Agenda" hint="One block per hour or per module.">
        <div className="space-y-4">
          {value.modules.map((m, i) => (
            <div key={i} className="rounded-xl border border-dune bg-cream p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="font-mono text-[0.68rem] text-slate-ink/60">
                  BLOCK {String(i + 1).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  onClick={() => set("modules", value.modules.filter((_, j) => j !== i))}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-dune text-slate-ink transition-colors hover:border-ember hover:text-ember"
                  aria-label="Remove block"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
                </button>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <Field label="Label">
                  <input
                    value={m.clock ?? ""}
                    placeholder="Hour 1"
                    onChange={(e) => {
                      const next = [...value.modules];
                      next[i] = { ...m, clock: e.target.value };
                      set("modules", next);
                    }}
                    className="field"
                  />
                </Field>
                <Field label="Title (English)">
                  <input
                    value={m.title}
                    onChange={(e) => {
                      const next = [...value.modules];
                      next[i] = { ...m, title: e.target.value };
                      set("modules", next);
                    }}
                    className="field"
                  />
                </Field>
                <Field label="Title (Arabic)">
                  <input
                    value={m.titleAr ?? ""}
                    dir="rtl"
                    onChange={(e) => {
                      const next = [...value.modules];
                      next[i] = { ...m, titleAr: e.target.value };
                      set("modules", next);
                    }}
                    className="field"
                  />
                </Field>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <ListEditor
                  label="Points (English)"
                  values={m.points ?? []}
                  onChange={(v) => {
                    const next = [...value.modules];
                    next[i] = { ...m, points: v };
                    set("modules", next);
                  }}
                />
                <ListEditor
                  label="Points (Arabic)"
                  values={m.pointsAr ?? []}
                  rtl
                  onChange={(v) => {
                    const next = [...value.modules];
                    next[i] = { ...m, pointsAr: v };
                    set("modules", next);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            set("modules", [
              ...value.modules,
              { clock: `Hour ${value.modules.length + 1}`, title: "", titleAr: "", points: [""], pointsAr: [] },
            ])
          }
          className="inline-flex items-center gap-1.5 rounded-full border border-dune px-4 py-2.5 text-[0.78rem] font-semibold text-teal transition-colors hover:border-gold hover:bg-gold/10 hover:text-abyss"
        >
          <Plus className="h-4 w-4" strokeWidth={2.2} />
          Add block
        </button>
      </Section>

      {/* ---- faqs ---- */}
      <Section title="Questions">
        <div className="space-y-4">
          {value.faqs.map((f, i) => (
            <div key={i} className="rounded-xl border border-dune bg-cream p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="font-mono text-[0.68rem] text-slate-ink/60">
                  Q{String(i + 1).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  onClick={() => set("faqs", value.faqs.filter((_, j) => j !== i))}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-dune text-slate-ink transition-colors hover:border-ember hover:text-ember"
                  aria-label="Remove question"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
                </button>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Question (English)">
                  <input
                    value={f.q}
                    onChange={(e) => {
                      const next = [...value.faqs];
                      next[i] = { ...f, q: e.target.value };
                      set("faqs", next);
                    }}
                    className="field"
                  />
                </Field>
                <Field label="Question (Arabic)">
                  <input
                    value={f.qAr ?? ""}
                    dir="rtl"
                    onChange={(e) => {
                      const next = [...value.faqs];
                      next[i] = { ...f, qAr: e.target.value };
                      set("faqs", next);
                    }}
                    className="field"
                  />
                </Field>
                <Field label="Answer (English)">
                  <textarea
                    rows={3}
                    value={f.a}
                    onChange={(e) => {
                      const next = [...value.faqs];
                      next[i] = { ...f, a: e.target.value };
                      set("faqs", next);
                    }}
                    className="field resize-y"
                  />
                </Field>
                <Field label="Answer (Arabic)">
                  <textarea
                    rows={3}
                    dir="rtl"
                    value={f.aAr ?? ""}
                    onChange={(e) => {
                      const next = [...value.faqs];
                      next[i] = { ...f, aAr: e.target.value };
                      set("faqs", next);
                    }}
                    className="field resize-y"
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => set("faqs", [...value.faqs, { q: "", a: "", qAr: "", aAr: "" }])}
          className="inline-flex items-center gap-1.5 rounded-full border border-dune px-4 py-2.5 text-[0.78rem] font-semibold text-teal transition-colors hover:border-gold hover:bg-gold/10 hover:text-abyss"
        >
          <Plus className="h-4 w-4" strokeWidth={2.2} />
          Add question
        </button>
      </Section>

      {/* ---- sticky save bar ---- */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-dune bg-parchment/95 backdrop-blur-xl lg:ps-60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <div className="min-w-0 flex-1">
            {error && (
              <p className="flex items-center gap-2 text-[0.82rem] text-ember">
                <TriangleAlert className="h-4 w-4 shrink-0" strokeWidth={1.9} />
                {error}
              </p>
            )}
            {saved && !error && (
              <p className="flex items-center gap-2 text-[0.82rem] text-moss">
                <CircleCheck className="h-4 w-4 shrink-0" strokeWidth={1.9} />
                Saved.
              </p>
            )}
          </div>
          <button type="submit" disabled={busy} className="btn-gold !py-2.5 !text-[0.84rem]">
            <Save className="h-4 w-4" strokeWidth={1.9} />
            {busy ? "Saving…" : isEdit ? "Save changes" : "Create workshop"}
          </button>
        </div>
      </div>
    </form>
  );
}
