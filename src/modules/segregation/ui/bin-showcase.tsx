"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { type KeyboardEvent, useEffect, useId, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { usePrefersReducedMotion } from "@/shared/motion/use-reduced-motion";
import { Icon, type IconName } from "@/shared/ui/icon";
import type { Bin, BinId } from "../data";

const ICON: Record<BinId, IconName> = {
  aprovechable: "recycle",
  organico: "leaf",
  "no-aprovechable": "trash",
  peligroso: "alert",
};

const WEEK = ["L", "M", "X", "J", "V", "S", "D"];
const WEEK_LABEL = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
const AUTOPLAY = 5500;

/**
 * Los cuatro colores como tachos ilustrados: el elegido se eleva, abre la tapa y le caen sus residuos.
 * Al lado, su ficha con los días de recojo. Recorre los colores solo hasta que el usuario elige uno.
 */
export function BinShowcase({ bins }: { bins: readonly Bin[] }) {
  const id = useId();
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [touched, setTouched] = useState(false);
  const bin = bins[index];

  useEffect(() => {
    if (touched || reduced) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % bins.length), AUTOPLAY);
    return () => clearTimeout(t);
  }, [index, touched, reduced, bins.length]);

  const pick = (i: number) => {
    setTouched(true);
    setIndex(i);
  };

  // flechas del teclado entre pestañas (patrón WAI-ARIA)
  const onKey = (e: KeyboardEvent) => {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + bins.length) % bins.length;
    pick(next);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  };

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
      {/* Escenario con los tachos */}
      <div className="relative">
        <div
          aria-hidden
          className="absolute inset-x-[8%] bottom-10 h-10 rounded-[50%] bg-[radial-gradient(closest-side,rgb(8_48_31/0.18),transparent)]"
        />
        <div
          role="tablist"
          aria-label="Colores de segregación"
          onKeyDown={onKey}
          className="relative grid grid-cols-4 items-end gap-3 px-2 pt-20 pb-2 sm:gap-5 sm:pt-28"
        >
          {bins.map((b, i) => {
            const on = i === index;
            return (
              <button
                key={b.id}
                id={`${id}-tab-${i}`}
                role="tab"
                type="button"
                aria-selected={on}
                aria-controls={`${id}-panel`}
                tabIndex={on ? 0 : -1}
                onClick={() => pick(i)}
                onPointerEnter={(e) => e.pointerType === "mouse" && pick(i)}
                className="group relative flex flex-col items-center rounded-2xl pb-2 focus-visible:outline-offset-4"
              >
                {/* residuos que caen dentro del tacho abierto */}
                {on && !reduced && (
                  <span aria-hidden className="pointer-events-none absolute inset-x-0 -top-16 h-32 overflow-visible sm:-top-24 sm:h-36">
                    {b.emoji.map((e, k) => (
                      <motion.span
                        key={`${b.id}-${e}`}
                        className="absolute left-1/2 text-2xl sm:text-3xl"
                        style={{ marginLeft: `${(k % 3) * 14 - 22}px` }}
                        initial={{ y: -40, opacity: 0, rotate: -20 }}
                        animate={{ y: [-40, 70], opacity: [0, 1, 1, 0], rotate: [-20, 25], scale: [1, 1, 0.6] }}
                        transition={{
                          duration: 1.3,
                          delay: k * 0.55,
                          repeat: Infinity,
                          repeatDelay: b.emoji.length * 0.55 - 0.4,
                          ease: "easeIn",
                        }}
                      >
                        {e}
                      </motion.span>
                    ))}
                  </span>
                )}
                <motion.span
                  className="block w-full max-w-[8.5rem]"
                  animate={{ y: on ? -16 : 0, scale: on ? 1.06 : 0.92, opacity: on ? 1 : 0.72 }}
                  whileHover={{ y: on ? -18 : -6, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                >
                  <BinArt bin={b} open={on} />
                </motion.span>
                <span className={cn("mt-2 text-sm font-extrabold transition-colors sm:text-base", on ? "text-tinta" : "text-pizarra")}>
                  {b.color}
                </span>
                <span className="hidden text-xs text-pizarra sm:block">{b.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ficha del color elegido */}
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${index}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={bin.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-panel ring-1 ring-bruma md:p-8"
          >
            <span aria-hidden className="absolute inset-y-0 left-0 w-1.5" style={{ background: bin.swatch }} />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold tracking-[0.14em] uppercase" style={{ color: bin.swatch }}>
                  {bin.container}
                </p>
                <h3 className="mt-1 text-4xl font-extrabold" style={{ color: bin.swatch }}>
                  {bin.color}
                </h3>
                <p className="text-lg font-bold text-puno-800">Residuos {bin.name.toLowerCase()}</p>
              </div>
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl text-white" style={{ background: bin.swatch }}>
                <Icon name={ICON[bin.id]} size={28} />
              </span>
            </div>
            <p className="mt-4 leading-relaxed text-pizarra">{bin.summary}</p>

            <div className="mt-5">
              <p className="text-xs font-bold tracking-[0.12em] text-pizarra uppercase">Días de recojo</p>
              {bin.weekdays.length ? (
                <p
                  className="mt-2 flex gap-1.5"
                  role="img"
                  aria-label={`Se recoge: ${bin.weekdays.map((d) => WEEK_LABEL[d - 1]).join(", ")}`}
                >
                  {WEEK.map((d, k) => {
                    const on = bin.weekdays.includes(k + 1);
                    return (
                      <span
                        key={d}
                        className={cn(
                          "grid size-9 place-items-center rounded-lg text-sm font-extrabold",
                          on ? "text-white" : "bg-cielo text-pizarra",
                        )}
                        style={on ? { background: bin.swatch } : undefined}
                      >
                        {d}
                      </span>
                    );
                  })}
                </p>
              ) : (
                <p className="mt-2 flex items-center gap-2 font-semibold text-tinta">
                  <Icon name="pin" size={18} style={{ color: bin.swatch }} />
                  Puntos de acopio municipales y campañas Sumaq Ayni
                </p>
              )}
            </div>

            <ul className="mt-5 grid gap-x-4 gap-y-2 sm:grid-cols-2">
              {bin.examples.map((e) => (
                <li key={e} className="flex items-start gap-2 text-sm font-semibold text-tinta">
                  <Icon name="checkCircle" size={17} className="mt-0.5 shrink-0" style={{ color: bin.swatch }} />
                  {e}
                </li>
              ))}
            </ul>

            <p className="mt-5 flex gap-2 rounded-xl bg-cielo p-3 text-sm text-pizarra">
              <Icon name="info" size={17} className="mt-0.5 shrink-0 text-puno" />
              {bin.tip}
            </p>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold">
              <Link href="/segregacion#buscador" className="inline-flex items-center gap-1.5 text-puno hover:underline">
                <Icon name="search" size={16} />
                Buscar un objeto
              </Link>
              <Link href="/segregacion" className="inline-flex items-center gap-1.5 text-puno hover:underline">
                Guía completa
                <Icon name="arrow" size={16} />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Tacho ilustrado: cuerpo del color de la NTP, tapa con bisagra que se abre, etiqueta con ícono y ruedas. */
function BinArt({ bin, open }: { bin: Bin; open: boolean }) {
  const dark = `color-mix(in srgb, ${bin.swatch} 72%, black)`;
  return (
    <svg viewBox="0 0 120 176" className="h-auto w-full drop-shadow-[0_14px_18px_rgb(8_48_31/0.22)]" aria-hidden>
      {/* tapa con bisagra a la izquierda */}
      <motion.g
        initial={false}
        animate={{ rotate: open ? -32 : 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 14 }}
        style={{ originX: 0.04, originY: 1 }}
      >
        <rect x="44" y="18" width="32" height="12" rx="5" style={{ fill: dark }} />
        <rect x="6" y="28" width="108" height="18" rx="7" style={{ fill: dark }} />
      </motion.g>
      {/* cuerpo */}
      <path d="M13 48H107L99 160Q98.5 166 92 166H28Q21.5 166 21 160Z" style={{ fill: bin.swatch }} />
      <path d="M13 48H107L106.4 56H13.6Z" fill="rgb(0 0 0 / 0.18)" />
      {[38, 60, 82].map((x) => (
        <path key={x} d={`M${x} 64V150`} stroke="rgb(255 255 255 / 0.14)" strokeWidth="4" strokeLinecap="round" />
      ))}
      {/* etiqueta */}
      <rect x="32" y="84" width="56" height="48" rx="10" fill="rgb(255 255 255 / 0.92)" />
      <Icon name={ICON[bin.id]} size={28} x={46} y={94} style={{ color: bin.swatch }} />
      {/* ruedas */}
      <circle cx="32" cy="168" r="7" fill="#1f2937" />
      <circle cx="88" cy="168" r="7" fill="#1f2937" />
    </svg>
  );
}
