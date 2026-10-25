export type SectorId = 1 | 2 | 3 | 4;
export type Shift = "manana" | "tarde" | "noche";
export type RouteStatus = "activo" | "programado";
/** ISO weekday: 1 = lunes … 7 = domingo */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type LatLng = readonly [lat: number, lng: number];

export interface CollectionRoute {
  slug: string;
  number: number;
  title: string;
  sector: SectorId;
  shift: Shift;
  /** "HH:mm" en hora de Lima */
  start: string;
  end: string;
  days: readonly number[];
  truck: string;
  households: number;
  status: RouteStatus;
  description: string;
  streets: readonly string[];
  landmarks: readonly string[];
  km: number;
  /** "detallado": recorrido calle por calle; "referencial": sólo inicio y fin, a la espera del GPS de la GGIRS */
  trace: "detallado" | "referencial";
  path: readonly LatLng[];
  photos?: { start: string; end: string };
}

export interface Sector {
  id: SectorId;
  name: string;
  short: string;
  summary: string;
  /** token de color definido en globals.css */
  tone: string;
}
