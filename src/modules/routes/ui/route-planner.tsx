"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useDeferredValue, useEffect, useId, useMemo, useRef, useState } from "react";
import { formatNumber, pad } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";
import { ButtonLink } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import { formatDays, formatTime, routeState, SHIFT_LABEL } from "../domain/schedule";
import { findRoutes } from "../domain/search";
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
  /** ruta abierta al cargar; sin ella se ve la lista completa */
  initialSelected?: string;
  initialQuery?: string;
}

/**
 * "¿Por dónde y cuándo pasa el camión?" con el patrón de las apps de mapas:
 * mapa a todo el ancho y un panel flotante que va de la lista de rutas (buscar y filtrar)
 * a la ficha de la ruta elegida, y vuelve.
 */
export function RoutePlanner({ routes, sectors, initialSelected, initialQuery = "" }: Props) {
  const id = useId();
  const clock = useLimaClock();
  const [query, setQuery] = useState(initialQuery);
  const [sector, setSector] = useState<SectorId | null>(null);
  const [today, setToday] = useState(false);
  const [selected, setSelected] = useState<string | null>(initialSelected ?? null);
  const [hover, setHover] = useState<string | null>(null);
  const deferred = useDeferredValue(query);
  const searching = deferred.trim().length >= 2;

  // Búsqueda tolerante (abreviaturas, signos, errores de tipeo); guarda en qué calle o lugar se encontró.
  const results = useMemo(
    () =>
      searching
        ? findRoutes(routes, deferred).map(({ route, field }) => ({ route, hit: field }))
        : routes.map((route) => ({ route, hit: null as string | null })),
    [deferred, routes, searching],
  );

  const visible = useMemo(
    () =>
      results.filter(
        ({ route }) =>
          (!sector || route.sector === sector) && (!today || !clock || (route.days.includes(clock.weekday) && route.status === "activo")),
      ),
    [results, sector, today, clock],
  );

  const active = routes.find((r) => r.slug === selected) ?? null;

  // Vista previa al pasar el cursor por la lista: con una pausa breve, para que el mapa no vuele
  // con cada fila que cruza el puntero.
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const previewSoon = (slug: string | null) => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setHover(slug), slug ? 380 : 250);
  };
  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  const mapRef = useRef<HTMLDivElement>(null);
  const open = useCallback((slug: string) => {
    clearTimeout(hoverTimer.current);
    setSelected(slug);
    setHover(null);
    // en celular el panel va debajo del mapa: se sube para ver el recorrido
    if (window.innerWidth < 1024) mapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const clearAll = () => {
    setQuery("");
    setSector(null);
    setToday(false);
  };

  // El panel flota sobre el mapa en escritorio: el mapa encuadra las rutas en el espacio que queda libre.
  const panelRef = useRef<HTMLElement>(null);
  const [inset, setInset] = useState(0);
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const measure = () => setInset(panel.getBoundingClientRect().right + 32);
    const ro = new ResizeObserver(measure);
    ro.observe(panel);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="relative">
      <div ref={mapRef} className="relative h-[55vh] min-h-[22rem] scroll-mt-20 lg:h-[min(48rem,calc(100svh-6rem))] lg:min-h-[38rem]">
        <LazyRouteMap
          routes={routes}
          selected={selected}
          preview={hover}
          insetLeft={inset}
          idleHint="Elige una ruta para ver su recorrido"
          className="h-full w-full"
        />
      </div>

      <div className="relative z-[500] lg:pointer-events-none lg:absolute lg:inset-0">
        <div className="lg:mx-auto lg:h-full lg:max-w-[80rem] lg:px-(--gutter) lg:py-5">
          <aside
            ref={panelRef}
            aria-label="Buscador de rutas"
            className="relative -mt-6 flex flex-col overflow-hidden rounded-t-3xl bg-white shadow-float lg:pointer-events-auto lg:mt-0 lg:h-full lg:w-[25rem] lg:rounded-2xl"
          >
            {/* Búsqueda y filtros */}
            <div className="border-b border-bruma p-4">
              <span aria-hidden className="mx-auto mb-3 block h-1 w-10 rounded-full bg-bruma lg:hidden" />
              <form
                role="search"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (visible[0]) open(visible[0].route.slug);
                }}
                className="flex items-center gap-2.5 rounded-xl bg-cielo px-3.5 ring-1 ring-transparent transition focus-within:bg-white focus-within:ring-puno"
              >
                <Icon name="search" size={19} className="shrink-0 text-puno" />
                <label htmlFor={`${id}-q`} className="sr-only">
                  Busca tu calle, barrio o número de ruta
                </label>
                <input
                  id={`${id}-q`}
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelected(null);
                  }}
                  placeholder="Tu calle o barrio: Jr. Lima, Laykakota…"
                  autoComplete="off"
                  className="min-h-12 flex-1 bg-transparent text-[0.95rem] outline-none placeholder:text-pizarra/80 focus-visible:shadow-none focus-visible:outline-none"
                />
              </form>
              <div className="-mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-0.5" data-lenis-prevent role="group" aria-label="Filtros">
                {[null, ...sectors.map((s) => s.id)].map((sid) => {
                  const s = sectors.find((x) => x.id === sid);
                  const on = sector === sid;
                  return (
                    <button
                      key={sid ?? "all"}
                      type="button"
                      aria-pressed={on}
                      onClick={() => {
                        setSector(sid);
                        setSelected(null);
                      }}
                      className={cn(
                        "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-bold transition-colors",
                        on ? "border-puno-800 bg-puno-800 text-white" : "border-bruma text-tinta hover:border-niebla",
                      )}
                    >
                      {s && (
                        <span aria-hidden className="size-2 rounded-full ring-1 ring-white/70" style={{ background: SECTOR_COLOR[s.id] }} />
                      )}
                      {s ? s.short : "Todas"}
                    </button>
                  );
                })}
                <button
                  type="button"
                  aria-pressed={today}
                  onClick={() => {
                    setToday((v) => !v);
                    setSelected(null);
                  }}
                  className={cn(
                    "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-bold transition-colors",
                    today ? "border-puno bg-puno text-white" : "border-bruma text-tinta hover:border-niebla",
                  )}
                >
                  <Icon name="calendar" size={15} />
                  Pasan hoy
                </button>
              </div>
            </div>

            {/* Lista ↔ ficha */}
            <div className="relative max-h-[34rem] overflow-y-auto lg:max-h-none lg:flex-1" data-lenis-prevent>
              <AnimatePresence mode="wait" initial={false}>
                {active ? (
                  <motion.div
                    key={`ficha-${active.slug}`}
                    initial={{ opacity: 0, x: 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 28 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="sticky top-0 z-10 border-b border-bruma bg-white/95 px-2 py-1.5 backdrop-blur">
                      <button
                        type="button"
                        onClick={() => setSelected(null)}
                        className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2.5 text-sm font-bold text-puno hover:bg-celeste-50"
                      >
                        <Icon name="chevronLeft" size={18} />
                        Todas las rutas
                      </button>
                    </div>
                    <RouteDetail route={active} sector={sectors.find((s) => s.id === active.sector)!} today={clock?.weekday} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="lista"
                    initial={{ opacity: 0, x: -28 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -28 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <p className="px-4 pt-3 pb-1 text-xs font-bold tracking-[0.1em] text-pizarra uppercase" aria-live="polite">
                      {visible.length === routes.length
                        ? `${routes.length} rutas · elige una`
                        : visible.length === 1
                          ? "1 ruta encontrada"
                          : `${visible.length} rutas encontradas`}
                    </p>
                    {visible.length === 0 ? (
                      <div className="px-4 py-6 text-sm text-pizarra">
                        <p>
                          {searching
                            ? `No encontramos “${deferred}”. Escribe el nombre de la calle sin “Jr.” ni “Av.”.`
                            : "Ninguna ruta coincide con los filtros."}
                        </p>
                        <button
                          type="button"
                          onClick={clearAll}
                          className="mt-3 min-h-10 rounded-lg font-bold text-puno underline underline-offset-4"
                        >
                          {searching ? "Borrar búsqueda" : "Quitar filtros"}
                        </button>
                      </div>
                    ) : (
                      <ul aria-label="Rutas de recolección" className="pb-2" onPointerLeave={() => previewSoon(null)}>
                        {visible.map(({ route, hit }) => {
                          const live = clock && routeState(route, clock).kind === "en-curso";
                          return (
                            <li key={route.slug}>
                              <button
                                type="button"
                                onClick={() => open(route.slug)}
                                onPointerEnter={() => previewSoon(route.slug)}
                                onFocus={() => previewSoon(route.slug)}
                                className="group flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-cielo"
                              >
                                <span
                                  className="grid size-11 shrink-0 place-items-center rounded-xl text-[0.95rem] font-extrabold text-white tabular-nums"
                                  style={{ background: SECTOR_COLOR[route.sector] }}
                                >
                                  <span className="sr-only">Ruta </span>
                                  {pad(route.number)}
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate font-bold text-tinta group-hover:text-puno">{route.title}</span>
                                  <span className="flex items-center gap-1.5 truncate text-sm text-pizarra">
                                    {hit ? (
                                      <>
                                        <Icon name="pin" size={13} className="shrink-0 text-puno" />
                                        <span className="truncate">{hit}</span>
                                      </>
                                    ) : (
                                      <span className="truncate">
                                        {formatTime(route.start)} · {formatDays(route.days)}
                                      </span>
                                    )}
                                  </span>
                                </span>
                                {live && (
                                  <span className="shrink-0 rounded-full bg-exito/10 px-2 py-0.5 text-[0.7rem] font-extrabold text-exito">
                                    Ahora
                                  </span>
                                )}
                                <Icon name="chevronRight" size={18} className="shrink-0 text-niebla group-hover:text-puno" />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function RouteDetail({ route, sector, today }: { route: PlannerRoute; sector: Sector; today?: Weekday }) {
  const color = SECTOR_COLOR[route.sector];
  const facts = [
    { icon: "clock", label: "Horario", value: `${formatTime(route.start)} a ${formatTime(route.end)}` },
    { icon: "calendar", label: "Frecuencia", value: formatDays(route.days) },
    { icon: "home", label: "Hogares", value: formatNumber(route.households) },
    { icon: "route", label: "Recorrido", value: `${formatNumber(route.km, { maximumFractionDigits: 1 })} km` },
  ] as const;

  return (
    <article aria-labelledby={`ruta-${route.slug}`} className="p-4 pt-4">
      <p className="text-xs font-bold" style={{ color }}>
        Sector {sector.id} · {sector.name} · Turno {SHIFT_LABEL[route.shift].toLowerCase()}
      </p>
      <h3 id={`ruta-${route.slug}`} className="mt-1.5 flex items-start gap-3">
        <span className="numeral text-5xl" style={{ color }}>
          {pad(route.number)}
        </span>
        <span className="pt-1 text-lg leading-snug font-extrabold text-puno-800">{route.title}</span>
      </h3>
      <RouteStatus route={route} className="mt-3 font-semibold text-tinta" />

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-bruma pt-4">
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

      <div className="mt-4">
        <WeekStrip days={route.days} today={today} />
      </div>

      <p className="mt-4 flex items-start gap-2 text-sm text-pizarra">
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
                  className="mt-1 size-2.5 rounded-full border-2"
                  style={{ borderColor: edge ? "transparent" : color, background: edge ? (i === 0 ? "#1f7a3a" : "#c72220") : "#fff" }}
                />
                {i < route.streets.length - 1 && <span className="mt-1 w-px flex-1 bg-niebla" />}
              </span>
              <span className="text-sm text-tinta">{street}</span>
            </li>
          );
        })}
      </ol>

      {route.trace === "referencial" && (
        <p className="mt-5 flex gap-2 rounded-xl bg-cielo p-3 text-xs leading-relaxed text-pizarra">
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
            <figure key={k} className="relative aspect-4/3 overflow-hidden rounded-lg bg-bruma">
              <Image src={route.photos![k]} alt={`${label} de la ruta ${pad(route.number)}`} fill sizes="200px" className="object-cover" />
              <figcaption className="absolute bottom-1.5 left-1.5 rounded-md bg-white/90 px-2 py-0.5 text-[0.7rem] font-bold text-tinta">
                {label}
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-2 pb-2">
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
    </article>
  );
}
