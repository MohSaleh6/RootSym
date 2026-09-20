"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export type AccordionItem = { q: string; a: string };

export default function Accordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-dune/80 overflow-hidden rounded-2xl border border-dune bg-parchment">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-5 px-6 py-5 text-start transition-colors hover:bg-sand/50"
            >
              <span className="font-display text-[1.1rem] font-semibold text-abyss">
                {item.q}
              </span>
              <ChevronDown
                className={`h-4.5 w-4.5 shrink-0 text-teal transition-transform duration-400 ${
                  isOpen ? "rotate-180" : ""
                }`}
                strokeWidth={2}
              />
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-500 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-6 text-[0.92rem] leading-relaxed text-slate-ink">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
