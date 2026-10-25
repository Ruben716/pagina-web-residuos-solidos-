"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useId, useState } from "react";
import { formatNumber } from "@/shared/lib/format";
import { compostImpact } from "../domain/impact";

function Tween({ value, digits = 0 }: { value: number; digits?: number }) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => formatNumber(v, { maximumFractionDigits: digits, minimumFractionDigits: digits }));
  useEffect(() => {
    const c = animate(mv, value, { duration: 0.6, ease: [0.16, 1, 0.3, 1] });
    return () => c.stop();
  }, [mv, value]);
  return <motion.span>{text}</motion.span>;
}

/** Cuánto orgánico separa y cuánto abono produce un hogar puneño según cuántas personas viven en él. */
export function ImpactCalculator({ tone = "light" }: { tone?: "dark" | "light" }) {
  const id = useId();
  const [people, setPeople] = useState(4);
  const r = compostImpact(people);
  const dark = tone === "dark";

  return (
    <div>
      <div className="flex items-end justify-between gap-6">
        <label htmlFor={id} className="text-lg font-bold text-tinta">
          Personas en tu hogar
        </label>
        <output htmlFor={id} className="numeral text-6xl text-puno" aria-live="polite">
          {people}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={1}
        max={12}
        value={people}
        onChange={(e) => setPeople(Number(e.target.value))}
        className="mt-6 h-2 w-full cursor-pointer accent-puno"
        aria-valuetext={`${people} ${people === 1 ? "persona" : "personas"}`}
      />

      <dl className={`mt-10 grid gap-px overflow-hidden rounded-2xl sm:grid-cols-3 ${dark ? "bg-white/10" : "bg-bruma"}`}>
        {[
          { label: "Orgánicos separados al mes", value: r.organicPerMonth, unit: "kg", digits: 1 },
          { label: "Abono que produces al mes", value: r.compostPerMonth, unit: "kg", digits: 1 },
          { label: "Bolsas de basura menos al año", value: r.bagsPerYear, unit: "bolsas", digits: 0 },
        ].map((m) => (
          <div key={m.label} className={`flex flex-col gap-3 p-5 ${dark ? "bg-noche" : "bg-cielo"}`}>
            <dt className={`text-sm ${dark ? "text-cielo/65" : "text-pizarra"}`}>{m.label}</dt>
            <dd className="flex items-baseline gap-2">
              <span className="numeral text-4xl text-puno-800 tabular-nums">
                <Tween value={m.value} digits={m.digits} />
              </span>
              <span className={dark ? "text-cielo/65" : "text-pizarra"}>{m.unit}</span>
            </dd>
          </div>
        ))}
      </dl>
      <p className={`mt-5 max-w-[70ch] text-xs leading-relaxed ${dark ? "text-cielo/50" : "text-pizarra"}`}>
        Cálculo: 0.55 kg de residuos por persona al día, de los cuales el 67.32 % es orgánico (Estudio de Caracterización de Residuos
        Sólidos de Puno, 2015). El compost maduro pesa cerca del 30 % de lo que entra a la compostera; una bolsa llena pesa unos 5 kg.
      </p>
    </div>
  );
}
