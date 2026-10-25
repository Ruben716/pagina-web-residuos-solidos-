import Link from "next/link";
import { RevealGroup, RevealItem } from "@/shared/motion/reveal";
import { Icon, type IconName } from "@/shared/ui/icon";
import type { Bin, BinId } from "../data";

const ICON: Record<BinId, IconName> = {
  aprovechable: "recycle",
  organico: "leaf",
  "no-aprovechable": "trash",
  peligroso: "alert",
};

/** Versión resumida de los cuatro colores para el inicio: color, días de recojo y tres ejemplos. */
export function BinSummary({ bins }: { bins: readonly Bin[] }) {
  return (
    <RevealGroup as="ul" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {bins.map((b) => (
        <RevealItem as="li" key={b.id}>
          <Link
            href="/segregacion#colores"
            className="group relative flex h-full flex-col overflow-hidden rounded-2xl p-5 text-white transition-transform duration-500 ease-out-expo hover:-translate-y-1"
            style={{ background: b.swatch }}
          >
            <span
              aria-hidden
              className="absolute -right-8 -bottom-8 size-32 rounded-full bg-white/10 transition-transform duration-700 ease-out-expo group-hover:scale-150"
            />
            <span className="relative flex items-start justify-between gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-white/15">
                <Icon name={ICON[b.id]} size={24} />
              </span>
              <span className="rounded-full bg-white/20 px-2.5 py-1 text-[0.68rem] font-extrabold tracking-[0.08em] uppercase ring-1 ring-white/30">
                {b.days}
              </span>
            </span>
            <span className="relative mt-6 text-3xl font-extrabold">{b.color}</span>
            <span className="relative font-bold">Residuos {b.name.toLowerCase()}</span>
            <span className="relative mt-3 text-sm text-white/85">{b.examples.slice(0, 3).join(" · ")}</span>
            <span className="relative mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-bold">
              Ver qué va aquí
              <Icon name="arrow" size={16} className="transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
            </span>
          </Link>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
