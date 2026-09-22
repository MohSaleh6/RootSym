"use client";

import { useEffect } from "react";

/**
 * Catches what error.tsx cannot: a failure in the root layout itself, before
 * any of the app's styling exists. It therefore renders its own <html> and
 * inlines everything, because no stylesheet is guaranteed to have loaded.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] root layout error", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#0b2a36",
          color: "#f6efdc",
          fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: "26rem", textAlign: "center" }}>
          <div
            style={{
              color: "#c9a227",
              fontSize: "12px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            RootSym
          </div>
          <h1 style={{ margin: "16px 0 0", fontSize: "24px", fontWeight: 600 }}>
            The site is briefly unavailable.
          </h1>
          <p style={{ margin: "12px 0 0", lineHeight: 1.65, color: "rgba(246,239,220,.7)" }}>
            We are already aware. Please try again in a moment.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "28px",
              padding: "14px 28px",
              borderRadius: "999px",
              border: "none",
              background: "#c9a227",
              color: "#16323d",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
