import { RevealGroup, RevealItem } from "@/shared/motion/reveal";
import { Icon, type IconName } from "@/shared/ui/icon";
import type { Bin, BinId } from "../data";

const ICON: Record<BinId, IconName> = {
  aprovechable: "recycle",
  organico: "leaf",
  "no-aprovechable": "trash",
  peligroso: "alert",
};

/** Los cuatro colores de la NTP 900.058:2019 con sus días de recojo y ejemplos. */
export function BinGrid({ bins }: { bins: readonly Bin[] }) {
  return (
    <RevealGroup as="ul" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {bins.map((b) => (
        <RevealItem
          as="li"
          key={b.id}
          className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-panel ring-1 ring-bruma transition-transform duration-500 ease-out-expo hover:-translate-y-1"
        >
          <div className="relative overflow-hidden p-5 text-white" style={{ background: b.swatch }}>
            <div
              aria-hidden
              className="absolute -top-10 -right-10 size-32 rounded-full bg-white/10 transition-transform duration-700 ease-out-expo group-hover:scale-125"
            />
            <div className="relative flex items-start justify-between gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-white/15">
                <Icon name={ICON[b.id]} size={24} />
              </span>
              <span className="rounded-full bg-white/20 px-2.5 py-1 text-[0.68rem] font-extrabold tracking-[0.08em] uppercase ring-1 ring-white/30">
                {b.days}
              </span>
            </div>
            <h3 className="relative mt-5 text-xl font-extrabold">Residuos {b.name.toLowerCase()}</h3>
            <p className="relative text-sm text-white/85">{b.container}</p>
          </div>
          <div className="flex flex-1 flex-col p-5">
            <p className="text-sm leading-relaxed text-pizarra">{b.summary}</p>
            <ul className="mt-4 space-y-2">
              {b.examples.map((e) => (
                <li key={e} className="flex items-start gap-2 text-sm font-semibold text-tinta">
                  <Icon name="checkCircle" size={17} className="mt-0.5 shrink-0" style={{ color: b.swatch }} />
                  {e}
                </li>
              ))}
            </ul>
            <p className="mt-5 flex gap-2 border-t border-bruma pt-4 text-sm text-pizarra">
              <Icon name="info" size={16} className="mt-0.5 shrink-0 text-puno" />
              {b.tip}
            </p>
          </div>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
