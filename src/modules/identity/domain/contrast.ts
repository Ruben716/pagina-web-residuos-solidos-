import type { Palette, ThemeToken } from "./identity";

/**
 * Contraste WCAG 2.2 de las combinaciones de color que el sitio usa de verdad. El panel no deja guardar
 * una paleta que rompa alguna: la Resolución 001-2025-PCM/SGTD exige WCAG 2.2 AA a las entidades públicas.
 */

type Ink = ThemeToken | "blanco";

interface Rule {
  fg: Ink;
  bg: Ink;
  /** 4.5 para texto normal; 3 para íconos, números grandes y bordes */
  min: 4.5 | 3;
  where: string;
}

export const CONTRAST_RULES: readonly Rule[] = [
  { fg: "blanco", bg: "puno", min: 4.5, where: "Texto de los botones principales" },
  { fg: "blanco", bg: "puno-800", min: 4.5, where: "Texto sobre bandas verdes y pie de página" },
  { fg: "blanco", bg: "noche", min: 4.5, where: "Texto sobre las bandas oscuras" },
  { fg: "tinta", bg: "blanco", min: 4.5, where: "Texto principal sobre blanco" },
  { fg: "tinta", bg: "cielo", min: 4.5, where: "Texto principal sobre fondo celeste" },
  { fg: "pizarra", bg: "blanco", min: 4.5, where: "Texto secundario sobre blanco" },
  { fg: "pizarra", bg: "cielo", min: 4.5, where: "Texto secundario sobre fondo celeste" },
  { fg: "puno", bg: "blanco", min: 4.5, where: "Enlaces y antetítulos sobre blanco" },
  { fg: "puno", bg: "cielo", min: 4.5, where: "Enlaces sobre fondo celeste" },
  { fg: "puno-800", bg: "blanco", min: 4.5, where: "Títulos sobre blanco" },
  { fg: "puno-800", bg: "cielo", min: 4.5, where: "Títulos sobre fondo celeste" },
  { fg: "puno-800", bg: "celeste-50", min: 4.5, where: "Etiquetas sobre celeste muy claro" },
  { fg: "puno-800", bg: "celeste-200", min: 4.5, where: "Etiquetas sobre celeste claro" },
  { fg: "noche", bg: "brote", min: 4.5, where: "Texto sobre la franja limón" },
  { fg: "noche", bg: "inti", min: 4.5, where: "Avisos y enlace «Saltar al contenido»" },
  { fg: "brote", bg: "noche", min: 4.5, where: "Antetítulos limón sobre bandas oscuras" },
  { fg: "celeste-200", bg: "puno", min: 4.5, where: "Antetítulos celestes sobre verde" },
  { fg: "exito", bg: "blanco", min: 4.5, where: "Mensajes de confirmación" },
  { fg: "puno-500", bg: "blanco", min: 3, where: "Números grandes y líneas decorativas" },
  { fg: "celeste", bg: "puno-800", min: 3, where: "Íconos del pie de página" },
];

const channel = (c: number) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

function luminance(hex: string) {
  const n = Number.parseInt(hex.slice(1), 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

export function contrastRatio(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export interface ContrastResult extends Rule {
  ratio: number;
  ok: boolean;
}

export function checkPalette(palette: Palette): ContrastResult[] {
  const color = (ink: Ink) => (ink === "blanco" ? "#ffffff" : palette[ink]);
  return CONTRAST_RULES.map((rule) => {
    const ratio = contrastRatio(color(rule.fg), color(rule.bg));
    return { ...rule, ratio, ok: ratio >= rule.min };
  });
}
