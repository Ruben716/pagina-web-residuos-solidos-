import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

interface Item {
  id: string;
  question: string;
  answer: ReactNode;
}

/**
 * Acordeón nativo (<details>) — funciona sin JavaScript. La apertura se anima con
 * ::details-content + interpolate-size donde el navegador lo soporta.
 */
export function Accordion({ items, name, className }: { items: readonly Item[]; name: string; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item) => (
        <details
          key={item.id}
          name={name}
          className="group rounded-2xl border border-bruma bg-white transition-[border-color,box-shadow] duration-300 [interpolate-size:allow-keywords] details-content:h-0 details-content:overflow-hidden details-content:transition-[height,content-visibility] details-content:[transition-behavior:allow-discrete] details-content:duration-500 details-content:ease-out-expo open:border-puno-500/40 open:shadow-panel open:details-content:h-auto"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-2xl px-6 py-5 text-left text-lg font-bold text-puno-800 marker:hidden hover:bg-cielo/60 [&::-webkit-details-marker]:hidden">
            {item.question}
            <span
              aria-hidden
              className="grid size-8 shrink-0 place-items-center rounded-full bg-celeste-50 text-puno transition-transform duration-500 ease-out-expo group-open:rotate-180"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </summary>
          <div className="max-w-[72ch] px-6 pb-6 leading-relaxed text-pizarra">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}
