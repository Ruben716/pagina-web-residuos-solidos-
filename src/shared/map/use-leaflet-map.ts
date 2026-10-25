"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { type RefObject, useEffect, useState } from "react";
import { SITE } from "@/shared/config/site";

/**
 * Crea un mapa de Leaflet sobre `ref` con el mapa base del sitio y lo destruye al desmontar.
 *
 * Se maneja Leaflet directamente (sin react-leaflet) porque, con el doble montaje de React en
 * desarrollo y la recarga en caliente, react-leaflet dejaba capas enganchadas a un mapa ya destruido
 * ("reading 'appendChild'"). Aquí cada montaje crea su mapa y cada desmontaje lo elimina entero;
 * quien use el mapa recibe la instancia vigente o `null`.
 */
export function useLeafletMap(
  ref: RefObject<HTMLElement | null>,
  options: L.MapOptions & { zoomPosition?: L.ControlPosition; bounds?: L.LatLngBoundsExpression },
) {
  const [map, setMap] = useState<L.Map | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { zoomPosition = "topleft", bounds, ...rest } = options;
    const instance = L.map(el, { zoomControl: false, scrollWheelZoom: false, ...rest });
    if (bounds) instance.fitBounds(bounds);
    L.control.zoom({ position: zoomPosition }).addTo(instance);
    L.tileLayer(SITE.map.tiles, { attribution: SITE.map.attribution, maxZoom: 19 }).addTo(instance);
    instance.attributionControl.setPrefix(false);
    instance.whenReady(() => setMap(instance));
    return () => {
      instance.remove();
    };
    // las opciones sólo se leen al crear el mapa
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  // tras un desmontaje, el mapa anterior ya no sirve
  return map && (map as unknown as { _containerId?: number })._containerId !== undefined ? map : null;
}

export const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
