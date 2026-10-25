"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useDeferredValue, useId, useMemo, useState } from "react";
import { formatNumber, pad } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";
import { ButtonLink } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import { formatDays, formatTime, SHIFT_LABEL } from "../domain/schedule";
import { normalize } from "../domain/search";
import type { CollectionRoute, Sector, SectorId, Weekday } from "../domain/types";
import { LazyRouteMap } from "./lazy-route-map";
import { SECTOR_COLOR } from "./route-map-colors";
import { RouteStatus } from "./route-status";
import { useLimaClock } from "./use-lima-clock";
import { WeekStrip } from "./week-strip";

export type PlannerRoute = Omit<CollectionRoute, "description">;

interface Props {
  routes: readonly PlannerRoute[];
  sectors: readonly Sector[];
  initialSelected?: string;
  initialQuery?: string;
}

interface Hit {
  route: PlannerRoute;
  field: string;
}

/**
 * "¿Por dónde y cuándo pasa el camión?": buscador de calles, filtros, selector de las 29 rutas,
 * mapa con el recorrido animado y ficha resumida de la ruta elegida.
 */
export function RoutePlanner({ routes, sectors, initialSelected = "ruta-01", initialQuery = "" }: Props) {
  const id = useId();
  const clock = useLimaClock();
  const [query, setQuery] = useState(initialQuery);
  const [sector, setSector] = useState<SectorId | null>(null);
  const [today, setToday] = useState(false);
  const [selected, setSelected] = useState(initialSelected);
  const deferred = useDeferredValue(query);

  // Coincidencias por calle, barrio o lugar: dicen en qué campo encontraron el texto.
  const hits = useMemo<Hit[]>(() => {
    const q = normalize(deferred);
    if (q.length < 2) return [];
    const out: Hit[] = [];
    for (const route of routes) {
      if (String(route.number) === q.replace(/^0/, "")) {
        out.push({ route, field: `Ruta ${pad(route.number)}` });
        continue;
      }
      const field = [route.title, ...route.streets, ...route.landmarks].find((f) => normalize(f).includes(q));
      if (field) out.push({ route, field });
    }
    return out;
  }, [deferred, routes]);

  const visible = useMemo(() => {
    let list = deferred.trim().length >= 2 ? hits.map((h) => h.route) : routes;
    if (sector) list = list.filter((r) => r.sector === sector);
    if (today && clock) list = list.filter((r) => r.days.includes(clock.weekday) && r.status === "activo");
    return list;
  }, [routes, hits, deferred, sector, today, clock]);

  const active = routes.find((r) => r.slug === selected) ?? routes[0];
  // la ruta elegida siempre está en el mapa, aunque los filtros la oculten de la lista
  const mapRoutes = useMemo(() => (visible.includes(active) ? visible : [...visible, active]), [visible, active]);
  const select = useCallback((slug: string) => setSelected(slug), []);

  const pick = (slug: string) => {
    setSelected(slug);
    setQuery("");
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-bruma bg-white shadow-panel">
      {/* Barra de búsqueda y filtros */}
      <div className="relative z-[500] border-b border-bruma bg-white p-4 md:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                if (hits[0]) pick(hits[0].route.slug);
              }}
              className="flex items-center gap-3 rounded-xl border border-niebla bg-cielo/60 px-4 transition-colors focus-within:border-puno focus-within:bg-white"
            >
              <Icon name="search" className="shrink-0 text-puno" />
              <label htmlFor={`${id}-q`} className="sr-only">
                Busca tu calle, barrio o número de ruta
              </label>
              <input
                id={`${id}-q`}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busca tu calle o barrio: Jr. Lima, Laykakota, Av. Floral…"
                autoComplete="off"
                aria-controls={`${id}-hits`}
                className="min-h-12 flex-1 bg-transparent text-[0.97rem] outline-none placeholder:text-pizarra/80 focus-visible:shadow-none focus-visible:outline-none"
              />
            </form>
            <div id={`${id}-hits`} aria-live="polite">
              <AnimatePresence>
                {deferred.trim().length >= 2 && (
                  <motion.ul
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-x-0 top-full z-10 mt-2 max-h-80 overflow-y-auto rounded-xl border border-bruma bg-white shadow-float"
                    data-lenis-prevent
                  >
                    {hits.length === 0 && (
                      <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm text-pizarra">
                        <span>
                          No encontramos “{deferred}”. Escribe el nombre de la calle sin “Jr.” ni “Av.”, o elige tu ruta en la lista.
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuery("")}
                          className="min-h-10 rounded-lg px-3 font-bold text-puno underline underline-offset-4 hover:bg-celeste-50"
                        >
                          Borrar búsqueda
                        </button>
                      </li>
                    )}
                    {hits.slice(0, 6).map(({ route, field }) => (
                      <li key={route.slug} className="border-b border-bruma last:border-0">
                        <button
                          type="button"
                          onClick={() => pick(route.slug)}
                          className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-celeste-50"
                        >
                          <span
                            className="grid size-10 shrink-0 place-items-center rounded-lg text-sm font-extrabold text-white"
                            style={{ background: SECTOR_COLOR[route.sector] }}
                          >
                            {pad(route.number)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-bold text-tinta">{field}</span>
                            <span className="block truncate text-sm text-pizarra">
                              Ruta {pad(route.number)} · {formatDays(route.days)}, {formatTime(route.start)}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <fieldset className="flex rounded-xl bg-cielo p-1">
              <legend className="sr-only">Sector</legend>
              {[null, ...sectors.map((s) => s.id)].map((sid) => {
                const s = sectors.find((x) => x.id === sid);
                const on = sector === sid;
                return (
                  <button
                    key={sid ?? "all"}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSector(sid)}
                    className={cn(
                      "relative flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-bold transition-colors",
                      on ? "text-puno-800" : "text-pizarra hover:text-tinta",
                    )}
                  >
                    {on && (
                      <motion.span
                        layoutId={`${id}-sector`}
                        className="absolute inset-0 rounded-lg bg-white shadow-sm"
                        transition={{ duration: 0.35 }}
                      />
                    )}
                    {s && <span aria-hidden className="relative size-2.5 rounded-full" style={{ background: SECTOR_COLOR[s.id] }} />}
                    <span className="relative">{s ? s.short : "Todos"}</span>
                  </button>
                );
              })}
            </fieldset>
            <button
              type="button"
              aria-pressed={today}
              onClick={() => setToday((v) => !v)}
              className={cn(
                "inline-flex min-h-12 items-center gap-2 rounded-xl border px-4 text-sm font-bold transition-colors",
                today ? "border-puno bg-puno text-white" : "border-niebla text-tinta hover:border-puno",
              )}
            >
              <Icon name="calendar" size={17} />
              Pasan hoy
            </button>
          </div>
        </div>

        {/* Selector de rutas */}
        <div className="mt-4 flex items-center gap-3">
          <p className="hidden shrink-0 text-xs font-bold tracking-[0.12em] text-pizarra uppercase md:block">
            {visible.length === routes.length ? `${routes.length} rutas` : `${visible.length} de ${routes.length}`}
          </p>
          <ul className="-mx-1 flex flex-1 gap-1.5 overflow-x-auto px-1 py-1" aria-label="Rutas de recolección" data-lenis-prevent>
            {visible.map((r) => {
              const on = r.slug === active.slug;
              return (
                <li key={r.slug}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSelected(r.slug)}
                    title={`Ruta ${pad(r.number)}: ${r.title}`}
                    className={cn(
                      "relative grid h-10 min-w-12 place-items-center rounded-lg border px-2 text-sm font-extrabold tabular-nums transition-[background-color,color,border-color,transform] duration-300 hover:-translate-y-0.5",
                      on ? "border-transparent text-white" : "border-bruma bg-white text-tinta hover:border-niebla",
                    )}
                    style={on ? { background: SECTOR_COLOR[r.sector] } : undefined}
                  >
                    <span className="sr-only">Ruta </span>
                    {pad(r.number)}
                    {!on && (
                      <span
                        aria-hidden
                        className="absolute inset-x-2 bottom-1 h-0.5 rounded-full"
                        style={{ background: SECTOR_COLOR[r.sector] }}
                      />
                    )}
                  </button>
                </li>
              );
            })}
            {visible.length === 0 && (
              <li className="py-2 text-sm text-pizarra">
                Ninguna ruta coincide con los filtros.{" "}
                <button
                  type="button"
                  onClick={() => {
                    setSector(null);
                    setToday(false);
                    setQuery("");
                  }}
                  className="font-bold text-puno underline underline-offset-4"
                >
                  Quitar filtros
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_25rem]">
        <LazyRouteMap routes={mapRoutes} selected={active.slug} onSelect={select} className="h-[58vh] min-h-[22rem] lg:h-[40rem]" />

        <div className="border-t border-bruma lg:max-h-[40rem] lg:overflow-y-auto lg:border-t-0 lg:border-l" data-lenis-prevent>
          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              key={active.slug}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              aria-labelledby={`${id}-title`}
              className="p-5 md:p-6"
            >
              <RoutePanel
                route={active}
                sector={sectors.find((s) => s.id === active.sector)!}
                titleId={`${id}-title`}
                today={clock?.weekday}
              />
            </motion.article>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function RoutePanel({ route, sector, titleId, today }: { route: PlannerRoute; sector: Sector; titleId: string; today?: Weekday }) {
  const color = SECTOR_COLOR[route.sector];
  const facts = [
    { icon: "clock", label: "Horario", value: `${formatTime(route.start)} a ${formatTime(route.end)}` },
    { icon: "calendar", label: "Frecuencia", value: formatDays(route.days) },
    { icon: "home", label: "Hogares", value: formatNumber(route.households) },
    { icon: "route", label: "Recorrido", value: `${formatNumber(route.km, { maximumFractionDigits: 1 })} km` },
  ] as const;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-white" style={{ background: color }}>
          Sector {sector.id} · {sector.name}
        </span>
        <span className="rounded-full bg-cielo px-2.5 py-1 text-puno-800">Turno {SHIFT_LABEL[route.shift].toLowerCase()}</span>
      </div>

      <h3 id={titleId} className="mt-4 flex items-start gap-3">
        <span className="numeral text-5xl" style={{ color }}>
          {pad(route.number)}
        </span>
        <span className="pt-1 text-lg leading-snug font-extrabold text-puno-800">{route.title}</span>
      </h3>

      <div className="mt-4 rounded-xl bg-cielo px-4 py-3">
        <RouteStatus route={route} className="font-semibold text-tinta" />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4">
        {facts.map((f) => (
          <div key={f.label}>
            <dt className="flex items-center gap-1.5 text-xs font-bold tracking-[0.08em] text-pizarra uppercase">
              <Icon name={f.icon} size={14} />
              {f.label}
            </dt>
            <dd className="mt-1 text-[0.95rem] font-bold text-tinta">{f.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5">
        <WeekStrip days={route.days} today={today} />
      </div>

      <p className="mt-5 flex items-start gap-2 text-sm text-pizarra">
        <Icon name="truck" size={17} className="mt-0.5 shrink-0 text-puno" />
        {route.truck}
      </p>

      <h4 className="mt-6 text-xs font-bold tracking-[0.12em] text-pizarra uppercase">Calles del recorrido</h4>
      <ol className="mt-3">
        {route.streets.map((street, i) => {
          const edge = i === 0 || i === route.streets.length - 1;
          return (
            <li key={street} className="relative flex gap-3 pb-2.5 last:pb-0">
              <span aria-hidden className="flex flex-col items-center">
                <span
                  className={cn("mt-1 size-2.5 rounded-full border-2", edge ? "border-transparent" : "bg-white")}
                  style={{ borderColor: edge ? undefined : color, background: edge ? (i === 0 ? "#1f7a3a" : "#c72220") : undefined }}
                />
                {i < route.streets.length - 1 && <span className="mt-1 w-px flex-1 bg-niebla" />}
              </span>
              <span className="text-sm text-tinta">{street}</span>
            </li>
          );
        })}
      </ol>

      {route.trace === "referencial" && (
        <p className="mt-5 flex gap-2 rounded-xl border border-dashed border-niebla p-3 text-xs leading-relaxed text-pizarra">
          <Icon name="info" size={16} className="mt-0.5 shrink-0 text-puno" />
          Recorrido referencial: el mapa une el inicio y el fin de la ruta. El trazado calle por calle se publicará cuando la gerencia
          registre el GPS de la unidad.
        </p>
      )}

      {route.photos && (
        <div className="mt-5 grid grid-cols-2 gap-2">
          {(
            [
              ["start", "Inicio"],
              ["end", "Fin"],
            ] as const
          ).map(([k, label]) => (
            <figure key={k} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-bruma">
              <Image src={route.photos![k]} alt={`${label} de la ruta ${pad(route.number)}`} fill sizes="200px" className="object-cover" />
              <figcaption className="absolute bottom-1.5 left-1.5 rounded-md bg-white/90 px-2 py-0.5 text-[0.7rem] font-bold text-tinta">
                {label}
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-2">
        <ButtonLink href={`/rutas/${route.slug}`} icon="arrow" className="w-full">
          Ver ficha completa
        </ButtonLink>
        <Link
          href={`/reporta?tipo=omision&ruta=${route.slug}`}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold text-puno hover:bg-celeste-50"
        >
          <Icon name="alert" size={16} />
          ¿No pasó el camión? Repórtalo
        </Link>
      </div>
    </>
  );
}
