"use client";

import { useEffect, useState } from "react";
import type { Media } from "@/shared/content/media";
import { cn } from "@/shared/lib/cn";
import { ImageReveal } from "@/shared/motion/image-reveal";
import { LineReveal } from "@/shared/motion/line-reveal";
import { Reveal, RevealGroup, RevealItem } from "@/shared/motion/reveal";
import { Icon } from "@/shared/ui/icon";
import type { Bin } from "../data";
import { BIN_ICON } from "./bin-art";

const WEEK = ["L", "M", "X", "J", "V", "S", "D"];
const WEEK_LABEL = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

const anchor = (b: Bin) => `color-${b.id}`;

/**
 * Los cuatro colores como bandas a todo el ancho, cada una pintada de su color, con foto real, días de
 * recojo, ejemplos y un consejo. Arriba, una barra fija de píldoras para saltar entre colores que se
 * marca sola según la banda que se está leyendo.
 */
export function BinBands({ bins, photos }: { bins: readonly Bin[]; photos: Record<Bin["id"], Media> }) {
  const [current, setCurrent] = useState(bins[0].id);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(e.target.id.replace("color-", "") as Bin["id"]);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const b of bins) {
      const el = document.getElementById(anchor(b));
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [bins]);

  return (
    <div id="colores">
      <nav aria-label="Ir a un color" className="sticky top-0 z-30 border-b border-bruma bg-white/95 backdrop-blur">
        <ul className="shell flex [scrollbar-width:none] gap-2 overflow-x-auto py-3">
          {bins.map((b) => {
            const on = current === b.id;
            return (
              <li key={b.id} className="shrink-0">
                <a
                  href={`#${anchor(b)}`}
                  aria-current={on ? "true" : undefined}
                  className={cn(
                    "flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-extrabold transition-colors",
                    on ? "border-transparent text-white" : "border-niebla text-tinta hover:border-puno",
                  )}
                  style={on ? { background: b.swatch } : undefined}
                >
                  <span aria-hidden className="size-3 rounded-full ring-2 ring-white" style={{ background: b.swatch }} />
                  {b.color}
                  <span className={cn("hidden font-semibold sm:inline", on ? "text-white/90" : "text-pizarra")}>· {b.name}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {bins.map((b, i) => (
        <BinBand key={b.id} bin={b} photo={photos[b.id]} index={i} />
      ))}
    </div>
  );
}

function BinBand({ bin, photo, index }: { bin: Bin; photo: Media; index: number }) {
  const flip = index % 2 === 1;
  return (
    <section
      id={anchor(bin)}
      aria-labelledby={`${anchor(bin)}-titulo`}
      className="relative scroll-mt-16 overflow-hidden py-16 text-white md:py-24"
      style={{ background: bin.swatch }}
    >
      {/* número de la categoría, enorme y casi transparente */}
      <span
        aria-hidden
        className={cn(
          "numeral pointer-events-none absolute top-1/2 -translate-y-1/2 text-[clamp(14rem,30vw,26rem)] leading-none text-white/[0.06] select-none",
          flip ? "-left-6" : "-right-6",
        )}
      >
        {index + 1}
      </span>

      <div className="shell relative grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className={cn("relative", flip && "lg:order-2")}>
          <ImageReveal
            media={photo}
            sizes="(min-width: 1024px) 45vw, 100vw"
            from={flip ? "left" : "bottom"}
            parallax={30}
            className="aspect-4/3 rounded-3xl"
          />
          <span
            className="absolute -bottom-5 left-6 grid size-16 place-items-center rounded-2xl bg-white shadow-float"
            style={{ color: bin.swatch }}
          >
            <Icon name={BIN_ICON[bin.id]} size={30} />
          </span>
        </div>

        <div>
          <Reveal>
            <p className="text-xs font-extrabold tracking-[0.16em] text-white/90 uppercase">{bin.container}</p>
          </Reveal>
          <LineReveal
            as="h2"
            text={bin.color}
            className="mt-2 text-[clamp(3.2rem,8vw,6rem)] leading-[0.9] font-extrabold tracking-[-0.03em]"
          />
          <Reveal delay={0.1}>
            <p id={`${anchor(bin)}-titulo`} className="mt-2 text-2xl font-bold">
              Residuos {bin.name.toLowerCase()}
            </p>
            <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-white/90">{bin.summary}</p>

            <div className="mt-6">
              <p className="text-xs font-bold tracking-[0.14em] text-white/90 uppercase">
                {bin.weekdays.length ? "Días de recojo" : "Dónde se entrega"}
              </p>
              {bin.weekdays.length ? (
                <p
                  role="img"
                  aria-label={`Se recoge: ${bin.weekdays.map((d) => WEEK_LABEL[d - 1]).join(", ")}`}
                  className="mt-2 flex gap-1.5"
                >
                  {WEEK.map((d, k) => {
                    const on = bin.weekdays.includes(k + 1);
                    return (
                      <span
                        key={d}
                        className={cn(
                          "grid size-10 place-items-center rounded-xl text-sm font-extrabold",
                          on ? "bg-white" : "bg-black/20 text-white/85",
                        )}
                        style={on ? { color: bin.swatch } : undefined}
                      >
                        {d}
                      </span>
                    );
                  })}
                </p>
              ) : (
                <p className="mt-2 flex items-center gap-2 font-semibold">
                  <Icon name="pin" size={18} />
                  {bin.schedule}
                </p>
              )}
            </div>
          </Reveal>

          <RevealGroup as="ul" className="mt-6 flex flex-wrap gap-2">
            {bin.examples.map((e) => (
              <RevealItem
                as="li"
                key={e}
                className="inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3.5 py-1.5 text-sm font-semibold"
              >
                <Icon name="check" size={15} />
                {e}
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal delay={0.2}>
            <p className="mt-7 flex max-w-[56ch] gap-3 border-l-4 border-white/70 pl-4 leading-relaxed">
              <span>
                <strong className="font-extrabold">Consejo:</strong> {bin.tip}
              </span>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
