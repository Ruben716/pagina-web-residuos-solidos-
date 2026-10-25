"use client";

import { SITE } from "@/shared/config/site";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

export type LatLngTuple = [number, number];

const pinIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#0072ad;border:3px solid #fff;box-shadow:0 6px 18px rgba(6,30,51,.35)"></span>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

function ClickToMove({ onChange }: { onChange: (p: LatLngTuple) => void }) {
  useMapEvents({ click: (e) => onChange([e.latlng.lat, e.latlng.lng]) });
  return null;
}

function Recenter({ position }: { position: LatLngTuple }) {
  const map = useMap();
  const [lat, lng] = position;
  useEffect(() => {
    map.panTo([lat, lng], { animate: true });
  }, [map, lat, lng]);
  return null;
}

export default function PinPicker({ position, onChange }: { position: LatLngTuple; onChange: (p: LatLngTuple) => void }) {
  const handlers = useMemo(
    () => ({
      dragend: (e: L.LeafletEvent) => {
        const { lat, lng } = (e.target as L.Marker).getLatLng();
        onChange([lat, lng]);
      },
    }),
    [onChange],
  );

  return (
    <MapContainer center={position} zoom={16} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer attribution={SITE.map.attribution} url={SITE.map.tiles} />
      <Marker position={position} draggable icon={pinIcon} eventHandlers={handlers} keyboard={false} />
      <ClickToMove onChange={onChange} />
      <Recenter position={position} />
    </MapContainer>
  );
}
