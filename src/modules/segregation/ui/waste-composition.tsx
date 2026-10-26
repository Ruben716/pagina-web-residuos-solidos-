"use client";

import { motion } from "motion/react";
import { formatNumber } from "@/shared/lib/format";
import { Counter } from "@/shared/motion/counter";
import { Icon, type IconName } from "@/shared/ui/icon";

export interface Share {
  label: string;
  /** a dónde va si se separa bien */
  fate: string;
  share: number;
  swatch: string;
  icon: IconName;
}

// espacio duro: "16 %" nunca se parte en dos líneas
const pct = (n: number) => `${formatNumber(n * 100, { maximumFractionDigits: 0 })} %`;

/**
 * Qué hay en la bolsa de un hogar puneño: una barra 100 % que se llena por partes al aparecer. Los colores
 * son los de la NTP y el verde y el marrón se confunden con daltonismo, así que cada parte lleva escritos
 * su porcentaje y su nombre, y debajo está la misma información como lista.
 */
export function WasteComposition({ shares, recoverable }: { shares: readonly Share[]; recoverable: number }) {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
      <div>
        <p className="numeral text-[clamp(4.5rem,11vw,8rem)] leading-none text-puno-800">
          <Counter value={Math.round(recoverable * 100)} suffix=" %" />
        </p>
        <p className="mt-4 max-w-[30ch] text-xl leading-snug font-extrabold text-tinta md:text-2xl">
          de lo que bota un hogar puneño <span className="rounded-md bg-brote/60 px-1.5">se puede aprovechar</span>
        </p>
        <p className="mt-3 max-w-[44ch] leading-relaxed text-pizarra">
          Solo hace falta que salga de casa separado. Lo que se mezcla en una sola bolsa termina en el relleno sanitario.
        </p>
      </div>

      <div>
        {/* barra: 2 px de separación entre partes, puntas redondeadas solo en los extremos */}
        {/* la barra completa decide cuándo entra en pantalla; sus partes se llenan una tras otra */}
        <motion.div
          aria-hidden
          className="flex h-24 gap-0.5 overflow-hidden rounded-2xl md:h-28"
          initial="hidden"
          whileInView="shown"
          viewport={{ once: true, margin: "-10% 0px" }}
        >
          {shares.map((s, i) => (
            <motion.div
              key={s.label}
              className="relative flex min-w-0 origin-left flex-col justify-between p-3 text-white md:p-4"
              style={{ background: s.swatch, flex: `${s.share} 1 0%` }}
              variants={{ hidden: { scaleX: 0 }, shown: { scaleX: 1 } }}
              transition={{ delay: i * 0.25, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <Icon name={s.icon} size={20} />
              <span className="numeral text-xl leading-none whitespace-nowrap sm:text-2xl md:text-3xl">{pct(s.share)}</span>
            </motion.div>
          ))}
        </motion.div>

        <ul className="mt-6 grid gap-5 sm:grid-cols-3">
          {shares.map((s) => (
            <li key={s.label} className="border-t-4 pt-3" style={{ borderColor: s.swatch }}>
              <p className="flex items-baseline justify-between gap-2">
                <span className="font-extrabold text-tinta">{s.label}</span>
                <span className="numeral text-lg text-tinta">{pct(s.share)}</span>
              </p>
              <p className="mt-1 flex items-start gap-1.5 text-sm leading-snug text-pizarra">
                <Icon name="arrow" size={15} className="mt-0.5 shrink-0 text-puno" />
                {s.fate}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
