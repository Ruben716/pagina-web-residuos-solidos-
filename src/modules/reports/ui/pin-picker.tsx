"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";
import { useLeafletMap } from "@/shared/map/use-leaflet-map";

export type LatLngTuple = [number, number];

const pinIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#16704a;border:3px solid #fff;box-shadow:0 6px 18px rgba(6,30,51,.35)"></span>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

/** Mapa para marcar el punto del reporte: el pin se arrastra o se mueve tocando el mapa. */
export default function PinPicker({ position, onChange }: { position: LatLngTuple; onChange: (p: LatLngTuple) => void }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useLeafletMap(el, { center: position, zoom: 16 });
  const marker = useRef<L.Marker | null>(null);
  const change = useRef(onChange);
  useEffect(() => {
    change.current = onChange;
  });

  // pin arrastrable y clic para moverlo
  useEffect(() => {
    if (!map) return;
    const m = L.marker(map.getCenter(), { draggable: true, icon: pinIcon, keyboard: false }).addTo(map);
    m.on("dragend", () => {
      const { lat, lng } = m.getLatLng();
      change.current([lat, lng]);
    });
    const onClick = (e: L.LeafletMouseEvent) => change.current([e.latlng.lat, e.latlng.lng]);
    map.on("click", onClick);
    marker.current = m;
    return () => {
      map.off("click", onClick);
      m.remove();
      marker.current = null;
    };
  }, [map]);

  // la posición manda: GPS, clic o arrastre
  const [lat, lng] = position;
  useEffect(() => {
    if (!map || !marker.current) return;
    marker.current.setLatLng([lat, lng]);
    map.panTo([lat, lng], { animate: true });
  }, [map, lat, lng]);

  return <div ref={el} className="h-full w-full" />;
}
