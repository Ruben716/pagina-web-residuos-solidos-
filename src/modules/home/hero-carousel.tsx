"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { type ReactNode, useEffect, useId, useState } from "react";
import type { Media } from "@/shared/content/media";
import { usePrefersReducedMotion } from "@/shared/motion/use-reduced-motion";
import { ButtonLink } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";

export interface Slide {
  id: string;
  /** rótulo corto: también nombra la pestaña del carrusel */
  badge: string;
  title: string;
  text: string;
  image: Pick<Media, "src" | "alt">;
  /** encuadre de la foto (object-position) */
  focus?: string;
  stats: readonly { value: string; label: string }[];
  cta: { href: string; label: string };
  secondary?: { href: string; label: string };
}

const INTERVAL = 7000;

/**
 * Portada en carrusel (patrón WAI-ARIA): pausa al pasar el cursor o enfocar, botón de pausa visible
 * y sin avance automático cuando el sistema pide reducir el movimiento.
 */
export function HeroCarousel({ slides, title, footer }: { slides: readonly Slide[]; title: string; footer?: ReactNode }) {
  const id = useId();
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hold, setHold] = useState(false);
  const running = playing && !hold && !reduced;
  const slide = slides[index];

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % slides.length), INTERVAL);
    return () => clearTimeout(t);
  }, [running, index, slides.length]);

  const go = (i: number) => setIndex((i + slides.length) % slides.length);

  return (
    <motion.section
      aria-roledescription="carrusel"
      aria-labelledby={`${id}-h`}
      className="relative isolate flex min-h-[calc(100svh-7.25rem)] flex-col overflow-hidden bg-noche text-white"
      onPointerEnter={() => setHold(true)}
      onPointerLeave={() => setHold(false)}
      onFocusCapture={() => setHold(true)}
      onBlurCapture={() => setHold(false)}
      // deslizar con el dedo cambia de diapositiva
      onPanEnd={(_, info) => {
        if (Math.abs(info.offset.x) < 60 || Math.abs(info.offset.x) < Math.abs(info.offset.y)) return;
        go(index + (info.offset.x < 0 ? 1 : -1));
      }}
      style={{ touchAction: "pan-y" }}
    >
      <h1 id={`${id}-h`} className="sr-only">
        {title}
      </h1>

      {/* Fotos apiladas: fundido cruzado y acercamiento lento de la activa */}
      <div aria-hidden className="absolute inset-0 -z-10">
        {slides.map((s, i) => (
          <motion.div
            key={s.id}
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: i === index ? 1 : 0, scale: i === index ? 1 : 1.08 }}
            transition={{ opacity: { duration: 1.1, ease: [0.4, 0, 0.2, 1] }, scale: { duration: 8, ease: [0.16, 1, 0.3, 1] } }}
          >
            <Image
              src={s.image.src}
              alt=""
              fill
              sizes="100vw"
              quality={70}
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "low"}
              className="object-cover"
              style={{ objectPosition: s.focus ?? "center" }}
            />
          </motion.div>
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(0_0_0/0.55)_0%,rgb(0_0_0/0.3)_38%,transparent_62%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-linear-to-t from-black/30 to-transparent" />
      </div>

      <div className="shell flex flex-1 flex-col justify-center pt-12 pb-10 md:pt-16">
        <div aria-live={running ? "off" : "polite"} aria-atomic>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={slide.id}
              role="group"
              aria-roledescription="diapositiva"
              aria-label={`${index + 1} de ${slides.length}: ${slide.badge}`}
              initial="hidden"
              animate="shown"
              exit="gone"
              variants={{ shown: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
              className="max-w-2xl"
            >
              <motion.p
                variants={item}
                className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-xs font-bold tracking-[0.12em] uppercase ring-1 ring-white/25 backdrop-blur"
              >
                <span className="size-1.5 rounded-full bg-inti" />
                {slide.badge}
              </motion.p>
              <motion.h2
                variants={item}
                className="mt-5 text-[clamp(2.3rem,5.6vw,4.3rem)] leading-[1.02] font-extrabold tracking-tight [text-shadow:0_2px_18px_rgb(0_0_0/0.45)]"
              >
                {slide.title}
              </motion.h2>
              <motion.p
                variants={item}
                className="mt-5 max-w-[54ch] text-lg leading-relaxed font-medium text-white [text-shadow:0_1px_10px_rgb(0_0_0/0.5)] md:text-xl"
              >
                {slide.text}
              </motion.p>
              <motion.dl variants={item} className="mt-7 flex flex-wrap gap-x-8 gap-y-3">
                {slide.stats.map((s) => (
                  <div
                    key={s.label}
                    className="flex flex-col-reverse border-l-2 border-celeste pl-3 [text-shadow:0_1px_8px_rgb(0_0_0/0.5)]"
                  >
                    <dt className="text-xs font-semibold text-white/90">{s.label}</dt>
                    <dd className="text-xl font-extrabold">{s.value}</dd>
                  </div>
                ))}
              </motion.dl>
              <motion.div variants={item} className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href={slide.cta.href} variant="white" icon="arrow">
                  {slide.cta.label}
                </ButtonLink>
                {slide.secondary && (
                  <ButtonLink href={slide.secondary.href} variant="ghost" className="bg-black/30 backdrop-blur-sm">
                    {slide.secondary.label}
                  </ButtonLink>
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {footer && <div className="shell relative pb-6 md:pb-8">{footer}</div>}

      {/* Sin controles visibles: sólo aparecen al navegar con teclado (pausa exigida por WCAG 2.2.2). */}
      <div className="pointer-events-none absolute top-6 right-(--gutter) flex gap-1.5 opacity-0 transition-opacity focus-within:pointer-events-auto focus-within:opacity-100">
        {[
          { label: "Diapositiva anterior", icon: "chevronLeft" as const, onClick: () => go(index - 1) },
          {
            label: playing && !reduced ? "Pausar el carrusel" : "Reproducir el carrusel",
            icon: playing && !reduced ? ("pause" as const) : ("play" as const),
            onClick: () => setPlaying((p) => !p),
          },
          { label: "Diapositiva siguiente", icon: "chevronRight" as const, onClick: () => go(index + 1) },
        ].map((c) => (
          <button
            key={c.icon}
            type="button"
            onClick={c.onClick}
            className="grid size-10 place-items-center rounded-full bg-white text-puno-800 shadow-float"
          >
            <Icon name={c.icon} size={18} />
            <span className="sr-only">{c.label}</span>
          </button>
        ))}
      </div>
    </motion.section>
  );
}

const item = {
  hidden: { opacity: 0, y: 26 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  gone: { opacity: 0, y: -12, transition: { duration: 0.3 } },
} as const;
