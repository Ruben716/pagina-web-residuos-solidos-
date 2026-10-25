"use client";

import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion, useLeafletMap } from "@/shared/map/use-leaflet-map";
import type { CollectionRoute, LatLng } from "../domain/types";
import { SECTOR_COLOR } from "./route-map-colors";

export type MapRoute = Pick<CollectionRoute, "slug" | "number" | "title" | "sector" | "path" | "trace">;

interface Props {
  routes: readonly MapRoute[];
  /** ruta elegida: el mapa vuela hasta ella, la dibuja y arranca el seguimiento del camión */
  selected?: string | null;
  /** vista previa (cursor sobre la lista): mismo vuelo y dibujo, un poco más rápido */
  preview?: string | null;
  /** px que ocupa un panel flotante a la izquierda en escritorio: el encuadre lo deja libre */
  insetLeft?: number;
  /** aviso sobre el mapa cuando no hay ninguna ruta a la vista */
  idleHint?: string;
  className?: string;
}

// Vista inicial: la ciudad de Puno, sin rutas
const CITY: L.LatLngBoundsExpression = [
  [-15.868, -70.048],
  [-15.818, -69.998],
];

/** Las rutas guardan coordenadas de sólo lectura; Leaflet pide arreglos propios. */
const toLatLngs = (path: readonly LatLng[]) => path.map(([lat, lng]) => [lat, lng] as L.LatLngTuple);

const endpoint = (label: string, color: string) =>
  L.divIcon({
    className: "",
    html: `<span class="endpoint-marker"><i style="background:${color}"></i>${label}</span>`,
    iconSize: undefined,
    iconAnchor: [10, 12],
  });

const TRUCK_SVG =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7M7.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/></svg>';

/** Camión que recorre la ruta en bucle. Devuelve la función que lo detiene y lo quita. */
function startTruck(map: L.Map, path: readonly LatLng[], label: string) {
  const marker = L.marker([path[0][0], path[0][1]], {
    icon: L.divIcon({ className: "", html: `<span class="truck-marker">${TRUCK_SVG}</span>`, iconSize: [34, 34], iconAnchor: [17, 17] }),
    keyboard: false,
    interactive: false,
    zIndexOffset: 1000,
  })
    .bindTooltip(label, { direction: "top", offset: [0, -18], className: "route-tip" })
    .addTo(map);
  if (prefersReducedMotion() || path.length < 2) return () => void marker.remove();

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
}

export default function RouteMap({ routes, selected, preview, insetLeft = 0, idleHint, className }: Props) {
  const el = useRef<HTMLDivElement>(null);
  // zoom a la derecha: a la izquierda flota el panel de rutas
  const map = useLeafletMap(el, { bounds: CITY, zoomPosition: "topright" });
  const activeSlug = selected ?? preview ?? null;
  const mode = selected ? "select" : preview ? "preview" : "idle";
  // ruta que ya terminó de dibujarse: entonces aparecen borde, inicio/fin, sentido y camión
  const [ready, setReady] = useState<string | null>(null);

  // 1. Vuelo de cámara y dibujo del trazo
  useEffect(() => {
    if (!map) return;
    const route = routes.find((r) => r.slug === activeSlug) ?? null;
    const reduced = prefersReducedMotion();
    const duration = reduced ? 0 : mode === "select" ? 1.8 : mode === "preview" ? 1.1 : 1.3;
    const left = insetLeft && window.innerWidth >= 1024 ? insetLeft : 40;
    let cancelled = false;
    let line: L.Polyline | null = null;

    if (route) {
      line = L.polyline(toLatLngs(route.path), {
        color: SECTOR_COLOR[route.sector],
        weight: 6,
        lineCap: "round",
        lineJoin: "round",
        dashArray: route.trace === "referencial" ? "8 10" : undefined,
        interactive: false,
      }).addTo(map);
      // oculto hasta que la cámara llega
      if (!reduced) line.getElement()?.setAttribute("stroke-opacity", "0");
    }

    let done = false;
    const settle = () => {
      if (done || cancelled) return;
      done = true;
      if (!route || !line) return;
      const path = line.getElement() as SVGPathElement | undefined;
      if (!path || reduced) return setReady(route.slug);
      const len = path.getTotalLength();
      path.style.transition = "none";
      path.style.strokeDasharray = `${len}`;
      path.style.strokeDashoffset = `${len}`;
      path.setAttribute("stroke-opacity", "1");
      path.getBoundingClientRect();
      path.style.transition = "stroke-dashoffset 1.5s cubic-bezier(0.65,0,0.35,1)";
      path.style.strokeDashoffset = "0";
      path.addEventListener(
        "transitionend",
        () => {
          path.style.strokeDasharray = "";
          path.style.strokeDashoffset = "";
          if (!cancelled) setReady(route.slug);
        },
        { once: true },
      );
    };
    map.once("moveend", settle);
    // por si la cámara ya estaba ahí y no hay movimiento
    const fallback = setTimeout(settle, duration * 1000 + 250);
    map.flyToBounds(route ? toLatLngs(route.path) : CITY, {
      paddingTopLeft: [left, 56],
      paddingBottomRight: [56, 56],
      duration,
      easeLinearity: 0.15,
      maxZoom: 16.5,
    });

    return () => {
      cancelled = true;
      clearTimeout(fallback);
      map.off("moveend", settle);
      line?.remove();
    };
  }, [map, routes, activeSlug, mode, insetLeft]);

  // 2. Ruta lista: borde blanco, sentido del recorrido, inicio/fin y camión
  const drawn = activeSlug !== null && ready === activeSlug;
  useEffect(() => {
    if (!map || !drawn) return;
    const route = routes.find((r) => r.slug === activeSlug);
    if (!route) return;
    const path = toLatLngs(route.path);
    const layers: L.Layer[] = [];
    const casing = L.polyline(path, {
      color: "#ffffff",
      weight: 12,
      opacity: 0.95,
      lineCap: "round",
      lineJoin: "round",
      interactive: false,
    }).addTo(map);
    casing.bringToBack();
    layers.push(casing);
    if (route.trace === "detallado") {
      layers.push(
        L.polyline(path, { color: "#ffffff", weight: 2.5, opacity: 0.9, className: "route-flow", interactive: false }).addTo(map),
      );
    }
    layers.push(L.marker(path[0], { icon: endpoint("Inicio", "#1f7a3a"), keyboard: false, interactive: false }).addTo(map));
    layers.push(L.marker(path.at(-1)!, { icon: endpoint("Fin", "#c72220"), keyboard: false, interactive: false }).addTo(map));
    const stopTruck = startTruck(map, route.path, `Ruta ${String(route.number).padStart(2, "0")}`);
    return () => {
      stopTruck();
      layers.forEach((l) => l.remove());
    };
  }, [map, routes, activeSlug, drawn]);

  return (
    <div className={`relative ${className ?? ""}`}>
      <div ref={el} className="h-full w-full" />
      {idleHint && !activeSlug && (
        <p className="pointer-events-none absolute bottom-8 left-1/2 z-[400] -translate-x-1/2 animate-pulse-soft rounded-full bg-white/95 px-4 py-2 text-sm font-bold whitespace-nowrap text-puno-800 shadow-panel lg:left-[calc(50%+13rem)]">
          {idleHint}
        </p>
      )}
    </div>
  );
}
