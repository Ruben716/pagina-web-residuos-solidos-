"use client";

import { SITE } from "@/shared/config/site";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useRef } from "react";
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import type { CollectionRoute, LatLng } from "../domain/types";
import { SECTOR_COLOR } from "./route-map-colors";

export type MapRoute = Pick<CollectionRoute, "slug" | "number" | "title" | "sector" | "path" | "trace">;

interface Props {
  routes: readonly MapRoute[];
  /** ruta seleccionada: se resalta, se dibuja y lleva su camión */
  selected?: string | null;
  onSelect?: (slug: string) => void;
  className?: string;
  /** muestra la leyenda de sectores */
  legend?: boolean;
}

const PUNO: [number, number] = [-15.8402, -70.0219];
const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const endpoint = (label: string, color: string) =>
  L.divIcon({
    className: "",
    html: `<span class="endpoint-marker"><i style="background:${color}"></i>${label}</span>`,
    iconSize: undefined,
    iconAnchor: [10, 12],
  });

const TRUCK_SVG =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7M7.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/></svg>';

/** Encuadra la ruta elegida (o toda la ciudad) y avisa cuando termina el vuelo. */
function Frame({ routes, selected, onSettled }: { routes: readonly MapRoute[]; selected?: string | null; onSettled: () => void }) {
  const map = useMap();
  useEffect(() => {
    const target = selected ? routes.filter((r) => r.slug === selected) : routes;
    const pts = target.flatMap((r) => r.path) as [number, number][];
    if (!pts.length) return;
    map.once("moveend", onSettled);
    map.flyToBounds(pts, { padding: [56, 56], duration: reducedMotion() ? 0 : 0.9, maxZoom: 16.5 });
    return () => void map.off("moveend", onSettled);
  }, [map, routes, selected, onSettled]);
  return null;
}

/** Camión que recorre la ruta en bucle. Con "reducir movimiento" queda quieto en el punto de inicio. */
function Truck({ path, label }: { path: readonly LatLng[]; label: string }) {
  const map = useMap();
  useEffect(() => {
    if (path.length < 2) return;
    const marker = L.marker(path[0] as [number, number], {
      icon: L.divIcon({ className: "", html: `<span class="truck-marker">${TRUCK_SVG}</span>`, iconSize: [34, 34], iconAnchor: [17, 17] }),
      keyboard: false,
      interactive: false,
      zIndexOffset: 1000,
    })
      .bindTooltip(label, { direction: "top", offset: [0, -18], className: "route-tip" })
      .addTo(map);

    if (reducedMotion()) return () => void marker.remove();

    // distancias acumuladas para avanzar a velocidad constante
    const pts = path.map((p) => L.latLng(p[0], p[1]));
    const acc = [0];
    for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + pts[i - 1].distanceTo(pts[i]));
    const total = acc.at(-1)!;
    const duration = Math.min(42, Math.max(14, total / 160)) * 1000;
    let frame = 0;
    let start: number | null = null;

    const tick = (t: number) => {
      start ??= t;
      const d = (((t - start) % duration) / duration) * total;
      let i = acc.findIndex((v) => v >= d);
      if (i <= 0) i = 1;
      const k = (d - acc[i - 1]) / (acc[i] - acc[i - 1] || 1);
      marker.setLatLng([pts[i - 1].lat + (pts[i].lat - pts[i - 1].lat) * k, pts[i - 1].lng + (pts[i].lng - pts[i - 1].lng) * k]);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      marker.remove();
    };
  }, [map, path, label]);
  return null;
}

export default function RouteMap({ routes, selected, onSelect, className, legend = true }: Props) {
  const lineRef = useRef<L.Polyline>(null);
  const active = routes.find((r) => r.slug === selected) ?? null;
  const color = active ? SECTOR_COLOR[active.sector] : "#0072ad";

  // Al terminar de encuadrar, el trazo de la ruta elegida se dibuja de inicio a fin.
  const drawIn = useCallback(() => {
    const el = lineRef.current?.getElement() as SVGPathElement | undefined;
    if (!el || reducedMotion()) return;
    const len = el.getTotalLength();
    el.style.transition = "none";
    el.style.strokeDasharray = `${len}`;
    el.style.strokeDashoffset = `${len}`;
    el.getBoundingClientRect();
    el.style.transition = "stroke-dashoffset 1.6s cubic-bezier(0.65,0,0.35,1)";
    el.style.strokeDashoffset = "0";
    el.addEventListener(
      "transitionend",
      () => {
        el.style.strokeDasharray = "";
        el.style.strokeDashoffset = "";
      },
      { once: true },
    );
  }, []);

  return (
    <div className={`relative ${className ?? ""}`}>
      <MapContainer center={PUNO} zoom={14} scrollWheelZoom={false} className="h-full w-full" attributionControl>
        <TileLayer attribution={SITE.map.attribution} url={SITE.map.tiles} />

        {routes.map((r) => {
          if (r.slug === selected) return null;
          return (
            <Polyline
              key={r.slug}
              positions={r.path as [number, number][]}
              pathOptions={{
                color: SECTOR_COLOR[r.sector],
                weight: 4,
                opacity: selected ? 0.32 : 0.85,
                dashArray: r.trace === "referencial" ? "6 9" : undefined,
                lineCap: "round",
                lineJoin: "round",
              }}
              eventHandlers={onSelect ? { click: () => onSelect(r.slug) } : undefined}
            >
              <Tooltip sticky className="route-tip">
                Ruta {String(r.number).padStart(2, "0")} · {r.title}
              </Tooltip>
            </Polyline>
          );
        })}

        {active && (
          <>
            <Polyline
              key={`${active.slug}-casing`}
              positions={active.path as [number, number][]}
              pathOptions={{ color: "#ffffff", weight: 12, opacity: 0.95, lineCap: "round", lineJoin: "round", interactive: false }}
            />
            <Polyline
              key={`${active.slug}-line`}
              ref={lineRef}
              positions={active.path as [number, number][]}
              pathOptions={{
                color,
                weight: 6,
                opacity: 1,
                lineCap: "round",
                lineJoin: "round",
                dashArray: active.trace === "referencial" ? "8 10" : undefined,
                interactive: false,
              }}
            />
            {active.trace === "detallado" && (
              <Polyline
                key={`${active.slug}-flow`}
                positions={active.path as [number, number][]}
                pathOptions={{ color: "#ffffff", weight: 2.5, opacity: 0.9, className: "route-flow", interactive: false }}
              />
            )}
            <Marker position={active.path[0] as [number, number]} icon={endpoint("Inicio", "#1f7a3a")} keyboard={false} />
            <Marker position={active.path.at(-1) as [number, number]} icon={endpoint("Fin", "#c72220")} keyboard={false} />
            <Truck key={active.slug} path={active.path} label={`Ruta ${String(active.number).padStart(2, "0")}`} />
          </>
        )}

        <Frame routes={routes} selected={selected} onSettled={drawIn} />
      </MapContainer>

      {legend && (
        <div className="pointer-events-none absolute bottom-6 left-3 z-[400] rounded-xl bg-white/95 px-3 py-2.5 text-[0.72rem] font-semibold text-tinta shadow-panel">
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
            {[
              [1, "Centro"],
              [2, "Norte"],
              [3, "Sur"],
              [4, "Alta"],
            ].map(([id, name]) => (
              <li key={id} className="flex items-center gap-2">
                <span className="h-1 w-4 rounded-full" style={{ background: SECTOR_COLOR[id as number] }} />
                Sector {id} · {name}
              </li>
            ))}
          </ul>
          <p className="mt-1.5 flex items-center gap-2 border-t border-bruma pt-1.5 font-medium text-pizarra">
            <span className="w-4 border-t-2 border-dashed border-pizarra" />
            Recorrido referencial
          </p>
        </div>
      )}
    </div>
  );
}
