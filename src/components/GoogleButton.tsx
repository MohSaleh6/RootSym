"use client";

import { useI18n } from "@/i18n/provider";

/** Google's own mark, inline — lucide has no brand icons and a CDN hit for one logo is not worth it. */
function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.92l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.95H1.26v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56V6.63H1.26a12 12 0 0 0 0 10.74l4.01-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.18 15.23 0 12 0A12 12 0 0 0 1.26 6.63l4.01 3.09C6.22 6.88 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

export default function GoogleButton({ next = "" }: { next?: string }) {
  const { t } = useI18n();
  const href = `/api/auth/google${next ? `?next=${encodeURIComponent(next)}` : ""}`;

  return (
    <a
      href={href}
      className="flex w-full items-center justify-center gap-3 rounded-full border border-sky/25 bg-cream px-6 py-3.5 text-[0.9rem] font-semibold text-abyss transition-all duration-300 hover:border-gold/60 hover:shadow-lux"
    >
      <GoogleGlyph />
      {t.auth.google}
    </a>
  );
}
