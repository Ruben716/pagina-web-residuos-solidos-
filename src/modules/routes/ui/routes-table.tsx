import Link from "next/link";
import { pad } from "@/shared/lib/format";
import { formatDays, formatTime, SHIFT_LABEL } from "../domain/schedule";
import type { CollectionRoute, Sector } from "../domain/types";
import { SECTOR_COLOR } from "./route-map-colors";
import { RouteStatus } from "./route-status";

interface Props {
  sectors: readonly Sector[];
  routes: readonly CollectionRoute[];
}

/** Cuadro oficial de horarios: una tabla por sector, legible e imprimible. */
export function RoutesTable({ sectors, routes }: Props) {
  return (
    <div className="space-y-12">
      {sectors.map((s) => {
        const items = routes.filter((r) => r.sector === s.id);
        return (
          <section key={s.id} aria-labelledby={`sector-${s.id}`}>
            <header className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 id={`sector-${s.id}`} className="flex items-center gap-3 text-xl font-extrabold text-puno-800">
                  <span aria-hidden className="h-6 w-1.5 rounded-full" style={{ background: SECTOR_COLOR[s.id] }} />
                  Sector {s.id}: {s.name}
                </h3>
                <p className="mt-1 text-sm text-pizarra">{s.summary}</p>
              </div>
              <p className="text-sm font-semibold text-pizarra">{items.length} rutas</p>
            </header>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-bruma">
              <table className="w-full min-w-[46rem] text-left text-sm">
                <caption className="sr-only">Rutas del sector {s.id}</caption>
                <thead className="bg-cielo text-xs font-bold tracking-[0.06em] text-pizarra uppercase">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      Ruta
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Zona que atiende
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Turno
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Horario
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Días
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Estado ahora
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bruma">
                  {items.map((r) => (
                    <tr key={r.slug} className="transition-colors hover:bg-celeste-50/60">
                      <td className="px-4 py-3">
                        <span className="numeral text-xl" style={{ color: SECTOR_COLOR[r.sector] }}>
                          {pad(r.number)}
                        </span>
                      </td>
                      <th scope="row" className="px-4 py-3 font-semibold">
                        <Link href={`/rutas/${r.slug}`} className="text-puno-800 hover:text-puno hover:underline">
                          {r.title}
                        </Link>
                      </th>
                      <td className="px-4 py-3">{SHIFT_LABEL[r.shift]}</td>
                      <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                        {formatTime(r.start)} a {formatTime(r.end)}
                      </td>
                      <td className="px-4 py-3">{formatDays(r.days)}</td>
                      <td className="px-4 py-3">
                        <RouteStatus route={r} className="text-tinta" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
