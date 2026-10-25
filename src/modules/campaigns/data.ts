import type { MediaKey } from "@/shared/content/media";

export interface Campaign {
  slug: string;
  title: string;
  kind: string;
  summary: string;
  /** ISO con zona horaria de Lima */
  start: string;
  end?: string;
  place: string;
  goal: string;
  audience?: string;
  image: MediaKey;
  /** resultado, si ya se realizó */
  result?: string;
}

// Contenido de ejemplo hasta que la GGIRS publique el calendario oficial.
export const CAMPAIGNS: readonly Campaign[] = [
  {
    slug: "gran-reciclaton-noviembre",
    title: "Gran Reciclatón Puneño",
    kind: "Canje de reciclables",
    summary: "Trae botellas PET, papel y cartón limpios y canjéalos por plantones nativos y abono del vivero municipal.",
    start: "2026-11-14T08:00:00-05:00",
    end: "2026-11-14T14:00:00-05:00",
    place: "Parque Pino, frente al templo San Juan",
    goal: "15 toneladas de reciclables",
    image: "botellas",
  },
  {
    slug: "limpieza-ribera-titicaca",
    title: "Limpieza de la ribera del Titicaca",
    kind: "Voluntariado",
    summary: "Brigadas vecinales retiran plásticos y residuos de la orilla de la bahía interior, del puerto al malecón ecoturístico.",
    start: "2026-11-22T07:00:00-05:00",
    end: "2026-11-22T11:00:00-05:00",
    place: "Bahía de Puno, del Puerto Lacustre al Malecón Ecoturístico",
    goal: "Ocho puntos críticos de la ribera",
    audience: "Mayores de 14 años; menores con un adulto",
    image: "urosNiebla",
  },
  {
    slug: "ecotrueque-compostaje",
    title: "Ecotrueque y taller de compostaje",
    kind: "Taller abierto",
    summary: "Aprende a armar tu compostera con materiales de casa e intercambia reciclables por semillas y abono.",
    start: "2026-11-27T09:00:00-05:00",
    end: "2026-11-27T15:00:00-05:00",
    place: "Plaza de Armas y Mercado Unión y Dignidad",
    goal: "300 familias capacitadas",
    audience: "Estudiantes y familias",
    image: "compostCajones",
  },
  {
    slug: "acopio-raee-pilas",
    title: "Acopio de pilas y aparatos en desuso",
    kind: "Residuos peligrosos",
    summary: "Entrega pilas, focos ahorradores, celulares y cargadores viejos para que tengan una disposición segura.",
    start: "2026-12-05T08:00:00-05:00",
    end: "2026-12-05T13:00:00-05:00",
    place: "Explanada del Estadio Enrique Torres Belón",
    goal: "2 toneladas de RAEE",
    image: "equipoCampo",
  },
  {
    slug: "reciclaton-marzo-2026",
    title: "Reciclatón de verano",
    kind: "Canje de reciclables",
    summary: "La primera jornada Sumaq Ayni del año reunió a vecinos de los cuatro sectores en el Parque Pino.",
    start: "2026-03-14T08:00:00-05:00",
    end: "2026-03-14T14:00:00-05:00",
    place: "Parque Pino",
    goal: "15 toneladas de reciclables",
    image: "botellas",
    result: "15 toneladas recuperadas y más de 1 200 participantes",
  },
];
