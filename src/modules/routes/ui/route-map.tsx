"use client";

import { SITE } from "@/shared/config/site";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { MapContainer, Marker, Polyline, TileLayer, useMap, ZoomControl } from "react-leaflet";
import type { CollectionRoute, LatLng } from "../domain/types";
import { SECTOR_COLOR } from "./route-map-colors";

export type MapRoute = Pick<CollectionRoute, "slug" | "number" | "title" | "sector" | "path" | "trace">;

interface Props {
  routes: readonly MapRoute[];
  /** ruta elegida: el mapa vuela hasta ella, la dibuja y arranca el seguimiento del camión */
  selected?: string | null;
  /** vista previa (cursor sobre la lista): vuela y dibuja, sin camión */
  preview?: string | null;
  /** px que ocupa un panel flotante a la izquierda en escritorio: el encuadre lo deja libre */
  insetLeft?: number;
  /** aviso sobre el mapa cuando no hay ninguna ruta a la vista */
  idleHint?: string;
  className?: string;
}

// Vista inicial: la ciudad de Puno, sin rutas
const CITY: [[number, number], [number, number]] = [
  [-15.868, -70.048],
  [-15.818, -69.998],
];
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

/**
 * Vuelo de cámara: hacia la ruta (zoom directo, con un leve alejamiento en el camino) o de vuelta a la ciudad.
 * Avisa una sola vez cuando la cámara se asienta.
 */
function Camera({
  target,
  mode,
  insetLeft = 0,
  onSettled,
}: {
  target: MapRoute | null;
  mode: "select" | "preview" | "idle";
  insetLeft?: number;
  onSettled: () => void;
}) {
  const map = useMap();
  useEffect(() => {
    const left = insetLeft && window.innerWidth >= 1024 ? insetLeft : 40;
    const duration = reducedMotion() ? 0 : mode === "select" ? 1.8 : mode === "preview" ? 1.1 : 1.3;
    let done = false;
    const settle = () => {
      if (done) return;
      done = true;
      onSettled();
    };
    map.once("moveend", settle);
    // por si la cámara ya estaba ahí y no hay movimiento
    const fallback = setTimeout(settle, duration * 1000 + 250);
    map.flyToBounds(target ? (target.path as [number, number][]) : CITY, {
      paddingTopLeft: [left, 56],
      paddingBottomRight: [56, 56],
      duration,
      easeLinearity: 0.15,
      maxZoom: 16.5,
    });
    return () => {
      clearTimeout(fallback);
      map.off("moveend", settle);
    };
  }, [map, target, mode, insetLeft, onSettled]);
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

export default function RouteMap({ routes, selected, preview, insetLeft, idleHint, className }: Props) {
  const lineRef = useRef<L.Polyline>(null);
  const chosen = routes.find((r) => r.slug === selected) ?? null;
  const active = chosen ?? routes.find((r) => r.slug === preview) ?? null;
  const mode = chosen ? "select" : active ? "preview" : "idle";
  // la ruta queda "lista" (marcadores, flujo y camión) cuando termina de dibujarse
  const [ready, setReady] = useState<string | null>(null);
  const drawn = !!active && ready === active.slug;
  // vista previa y selección muestran lo mismo: inicio, fin, sentido del recorrido y camión
  const isReady = drawn;
  const color = active ? SECTOR_COLOR[active.sector] : "#0072ad";

  // Al asentarse la cámara, el trazo se dibuja de inicio a fin.
  const activeSlug = active?.slug ?? null;
  const drawIn = () => {
    const el = lineRef.current?.getElement() as SVGPathElement | undefined;
    if (!el || !activeSlug) return;
    if (reducedMotion()) {
      el.style.strokeOpacity = "1";
      return setReady(activeSlug);
    }
    const len = el.getTotalLength();
    el.style.transition = "none";
    el.style.strokeDasharray = `${len}`;
    el.style.strokeDashoffset = `${len}`;
    el.style.strokeOpacity = "1";
    el.getBoundingClientRect();
    el.style.transition = "stroke-dashoffset 1.5s cubic-bezier(0.65,0,0.35,1)";
    el.style.strokeDashoffset = "0";
    el.addEventListener(
      "transitionend",
      () => {
        el.style.strokeDasharray = "";
        el.style.strokeDashoffset = "";
        setReady(activeSlug);
      },
      { once: true },
    );
  };
  // la cámara recibe una función estable; la versión vigente de drawIn vive en una ref
  const drawRef = useRef(drawIn);
  // (layout effect: queda al día antes de que la cámara pueda avisar)
  useLayoutEffect(() => {
    drawRef.current = drawIn;
  });
  const onSettled = useCallback(() => drawRef.current(), []);

  return (
    <div className={`relative ${className ?? ""}`}>
      <MapContainer bounds={CITY} scrollWheelZoom={false} zoomControl={false} className="h-full w-full" attributionControl>
        <ZoomControl position="topright" />
        <TileLayer attribution={SITE.map.attribution} url={SITE.map.tiles} />

        {active && (
          <>
            {drawn && (
              <Polyline
                key={`${active.slug}-casing`}
                positions={active.path as [number, number][]}
                pathOptions={{ color: "#ffffff", weight: 12, opacity: 0.95, lineCap: "round", lineJoin: "round", interactive: false }}
                // se agrega después de la línea: va al fondo para quedar como borde
                eventHandlers={{ add: (e) => (e.target as L.Polyline).bringToBack() }}
              />
            )}
            <Polyline
              key={`${active.slug}-line`}
              ref={lineRef}
              positions={active.path as [number, number][]}
              pathOptions={{
                color,
                weight: 6,
                // oculta hasta que la cámara llega: entonces se dibuja
                opacity: reducedMotion() ? 1 : 0,
                lineCap: "round",
                lineJoin: "round",
                dashArray: active.trace === "referencial" ? "8 10" : undefined,
                interactive: false,
              }}
            />
            {isReady && (
              <>
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
          </>
        )}

        <Camera target={active} mode={mode} insetLeft={insetLeft} onSettled={onSettled} />
      </MapContainer>

      {idleHint && !active && (
        <p className="pointer-events-none absolute bottom-8 left-1/2 z-[400] -translate-x-1/2 animate-pulse-soft rounded-full bg-white/95 px-4 py-2 text-sm font-bold whitespace-nowrap text-puno-800 shadow-panel lg:left-[calc(50%+13rem)]">
          {idleHint}
        </p>
      )}
    </div>
  );
}
