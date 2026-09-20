"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  /** distance in px the element travels in */
  y?: number;
  x?: number;
  once?: boolean;
};

export default function Reveal({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
  y = 26,
  x = 0,
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  // Must start hidden on both the server and the client, otherwise React
  // reports a hydration mismatch on the inline style.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Very old browsers: reveal on the next frame rather than never.
    if (typeof IntersectionObserver === "undefined") {
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) io.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [once]);

  return (
    <Tag
      ref={ref}
      data-reveal=""
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : `translate3d(${x}px, ${y}px, 0)`,
        transition: `opacity .95s cubic-bezier(.22,1,.36,1) ${delay}ms, transform .95s cubic-bezier(.22,1,.36,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}
