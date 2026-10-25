import type { Sector } from "../domain/types";

export const SECTORS: readonly Sector[] = [
  {
    id: 1,
    name: "Centro Histórico",
    short: "Centro",
    summary: "Plaza Mayor, Laykakota, Huajsapata, Bellavista y el borde del puerto lacustre.",
    tone: "var(--sector-1)",
  },
  {
    id: 2,
    name: "Zona Norte",
    short: "Norte",
    summary: "Ciudad universitaria, Yanamayo, Alto Puno y las urbanizaciones de expansión norte.",
    tone: "var(--sector-2)",
  },
  {
    id: 3,
    name: "Zona Sur",
    short: "Sur",
    summary: "Salcedo, Jayllihuaya, Chanu Chanu y los barrios que bordean la bahía sur.",
    tone: "var(--sector-3)",
  },
  {
    id: 4,
    name: "Zona Alta y Expansión",
    short: "Alta",
    summary: "Laderas altas y nuevos asentamientos, con unidades de tracción reforzada.",
    tone: "var(--sector-4)",
  },
];
