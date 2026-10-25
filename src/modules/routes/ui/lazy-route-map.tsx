"use client";

import dynamic from "next/dynamic";

/** Leaflet necesita `window`: se carga sólo en el cliente y fuera del bundle inicial. */
export const LazyRouteMap = dynamic(() => import("./route-map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-cielo text-sm font-semibold text-pizarra">
      <span className="inline-flex items-center gap-2">
        <span className="size-2 animate-pulse-soft rounded-full bg-puno-500" />
        Cargando mapa de Puno…
      </span>
    </div>
  ),
});
