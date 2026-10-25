"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { type KeyboardEvent, useId, useState } from "react";
import { MEDIA } from "@/shared/content/media";
import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icon";
import type { WorkLine } from "../data";

/**
 * Líneas de trabajo como pestañas verticales: a la izquierda la lista numerada, a la derecha la foto
 * y el detalle de la elegida. El cursor basta para cambiarla; con teclado, flechas arriba y abajo.
 */
export function WorkLines({ lines }: { lines: readonly WorkLine[] }) {
  const id = useId();
  const [index, setIndex] = useState(0);
  const line = lines[index];
  const media = MEDIA[line.image];

  const onKey = (e: KeyboardEvent) => {
    const delta = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + lines.length) % lines.length;
    setIndex(next);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
      <div role="tablist" aria-orientation="vertical" aria-label="Líneas de trabajo" onKeyDown={onKey} className="flex flex-col">
        {lines.map((l, i) => {
          const on = i === index;
          return (
            <button
              key={l.id}
              id={`${id}-tab-${i}`}
              role="tab"
              type="button"
              aria-selected={on}
              aria-controls={`${id}-panel`}
              tabIndex={on ? 0 : -1}
              onClick={() => setIndex(i)}
              onPointerEnter={(e) => e.pointerType === "mouse" && setIndex(i)}
              className="group relative flex items-center gap-5 border-b border-white/15 py-5 text-left first:border-t"
            >
              <span
                aria-hidden
                className={cn(
                  "absolute bottom-[-1px] left-0 h-0.5 bg-brote transition-[width] duration-700 ease-out-expo",
                  on ? "w-full" : "w-0",
                )}
              />
              <span className={cn("numeral w-10 shrink-0 text-lg transition-colors", on ? "text-brote" : "text-white/60")}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block text-xl font-extrabold transition-colors md:text-2xl",
                    on ? "text-white" : "text-white/75 group-hover:text-white",
                  )}
                >
                  {l.title}
                </span>
                <span className="mt-0.5 block text-sm text-white/70">{l.unit}</span>
              </span>
              <Icon
                name="arrow"
                size={20}
                className={cn(
                  "shrink-0 transition-all duration-500 ease-out-expo",
                  on ? "translate-x-0 text-brote" : "-translate-x-2 text-white/0",
                )}
              />
            </button>
          );
        })}
      </div>

      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${index}`} className="relative">
        <div className="relative aspect-4/3 overflow-hidden rounded-3xl bg-noche lg:aspect-auto lg:h-[26rem]">
          <AnimatePresence initial={false}>
            <motion.div
              key={line.id}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ opacity: { duration: 0.6 }, scale: { duration: 1.4, ease: [0.16, 1, 0.3, 1] } }}
            >
              <Image src={media.src} alt={media.alt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            </motion.div>
          </AnimatePresence>
          <span className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-puno-800 shadow-sm">
            <Icon name={line.icon} size={15} className="text-puno" />
            {line.unit}
          </span>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={line.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="pt-6"
          >
            <p className="max-w-[60ch] text-lg leading-relaxed text-white/90">{line.text}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {line.points.map((p) => (
                <li
                  key={p}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-white"
                >
                  <Icon name="check" size={15} className="text-brote" />
                  {p}
                </li>
              ))}
            </ul>
            {line.link && (
              <Link href={line.link.href} className="mt-5 inline-flex items-center gap-2 font-bold text-white hover:underline">
                {line.link.label}
                <Icon name="arrow" size={18} className="text-brote" />
              </Link>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
