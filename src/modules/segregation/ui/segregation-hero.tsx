"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Media } from "@/shared/content/media";
import { cn } from "@/shared/lib/cn";
import { usePrefersReducedMotion } from "@/shared/motion/use-reduced-motion";
import { ButtonLink } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import type { Bin } from "../data";
import { BinArt } from "./bin-art";

const TURN = 1900;

interface Props {
  bins: readonly Bin[];
  lede: string;
  /** foto real de fondo, bajo un velo verde para que el texto se lea */
  photo: Pick<Media, "src" | "alt">;
}

/**
 * Portada de la página: foto real de fondo, titular con los cuatro colores subrayándose uno tras otro y,
 * al lado, los cuatro tachos; por turnos cada uno abre la tapa y le cae un residuo de los suyos.
 */
export function SegregationHero({ bins, lede, photo }: Props) {
  const reduced = usePrefersReducedMotion();
  const [turn, setTurn] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setTurn((n) => n + 1), TURN);
    return () => clearInterval(t);
  }, [reduced]);

  const active = reduced ? -1 : turn % bins.length;
  const bin = bins[Math.max(active, 0)];
  const drop = bin.emoji[Math.floor(turn / bins.length) % bin.emoji.length];

  return (
    <section className="relative isolate overflow-hidden bg-noche text-white">
      <Image
        src={photo.src}
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 animate-ken-burns object-cover"
        style={{ objectPosition: "60% 50%" }}
      />
      {/* velo parejo: la foto se ve, el texto se lee */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-noche/80" />

      <div className="shell grid items-center gap-12 pt-10 pb-14 md:pb-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <nav aria-label="Ruta de navegación" className="text-sm text-white/80">
            <ol className="flex items-center gap-1.5">
              <li>
                <Link href="/" className="inline-flex items-center gap-1.5 hover:text-white hover:underline">
                  <Icon name="home" size={15} />
                  Inicio
                </Link>
              </li>
              <li className="flex items-center gap-1.5">
                <Icon name="chevronRight" size={14} className="opacity-60" />
                <span aria-current="page" className="font-semibold text-white">
                  Segregación
                </span>
              </li>
            </ol>
          </nav>

          <p className="mt-10 text-xs font-extrabold tracking-[0.16em] text-brote uppercase md:mt-14">Segregación en la fuente</p>
          <h1 className="mt-4 text-[clamp(2.3rem,5.4vw,4rem)] leading-[1.04] font-extrabold tracking-[-0.025em]">
            Separa tus residuos en{" "}
            <span className="relative inline-block pb-2">
              cuatro colores
              <span aria-hidden className="absolute inset-x-0 bottom-0 flex h-2 gap-1">
                {bins.map((b, i) => (
                  <motion.span
                    key={b.id}
                    className="h-full flex-1 origin-left rounded-full"
                    style={{ background: b.swatch, boxShadow: "0 0 0 1px rgb(255 255 255 / 0.25)" }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5 + i * 0.18, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                ))}
              </span>
            </span>
          </h1>
          <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-white/85">{lede}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="#buscador" variant="white" icon="search">
              ¿Dónde va esto?
            </ButtonLink>
            <ButtonLink href="#juego" variant="ghost" icon="play">
              Juega y aprende
            </ButtonLink>
          </div>
        </div>

        <div aria-hidden className="relative mx-auto w-full max-w-xl">
          <div className="relative grid grid-cols-4 items-end gap-3 pt-24 sm:gap-5">
            {bins.map((b, i) => {
              const open = i === active;
              return (
                <div key={b.id} className="relative flex flex-col items-center">
                  {/* el residuo que cae en el tacho abierto */}
                  <AnimatePresence>
                    {open && (
                      <motion.span
                        key={turn}
                        className="absolute -top-20 text-4xl sm:text-5xl"
                        initial={{ y: -30, opacity: 0, rotate: -25 }}
                        animate={{ y: [-30, 20, 95], opacity: [0, 1, 1, 0], rotate: [-25, 0, 30], scale: [1, 1, 0.5] }}
                        transition={{ duration: 1.1, delay: 0.25, ease: "easeIn" }}
                      >
                        {drop}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <motion.div
                    className="w-full"
                    animate={{ y: open ? -14 : 0, scale: open ? 1.05 : 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  >
                    <BinArt bin={b} open={open} className="h-auto w-full drop-shadow-[0_18px_22px_rgb(0_0_0/0.45)]" />
                  </motion.div>
                  <span className={cn("mt-3 text-sm font-extrabold transition-colors sm:text-base", open ? "text-white" : "text-white/70")}>
                    {b.color}
                  </span>
                </div>
              );
            })}
          </div>
          {/* piso */}
          <div className="mx-[6%] mt-2 h-1.5 rounded-full bg-white/15" />
        </div>
      </div>
    </section>
  );
}
