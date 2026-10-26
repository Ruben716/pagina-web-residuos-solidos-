import { z } from "zod";
import { SITE } from "@/shared/config/site";

/**
 * Identidad editable del sitio: nombres, contacto, redes, enlaces, paleta y tipografía.
 * Los valores de fábrica salen del código (site.ts y globals.css); la base de datos solo guarda la versión
 * editada, y si falta o está dañada se vuelve a los de fábrica.
 */

// ---------- paleta ----------

export const PALETTE_GROUPS = [
  { id: "marca", label: "Colores de marca", hint: "Botones, encabezados, bandas y pie de página." },
  { id: "acentos", label: "Acentos", hint: "Detalles, etiquetas y llamados de atención." },
  { id: "fondos", label: "Fondos y bordes", hint: "Secciones claras, separadores y bordes." },
  { id: "texto", label: "Texto", hint: "Texto principal y secundario." },
] as const;

/**
 * Colores editables. Los cuatro de la NTP 900.058:2019 (verde, marrón, negro y rojo de los residuos)
 * NO están aquí: son norma técnica y no se cambian desde el panel.
 */
export const THEME_TOKENS = [
  { id: "puno-800", label: "Verde institucional oscuro", group: "marca", fallback: "#0d4a33" },
  { id: "puno", label: "Verde institucional", group: "marca", fallback: "#16704a" },
  { id: "puno-500", label: "Verde medio", group: "marca", fallback: "#26935f" },
  { id: "noche", label: "Verde noche (bandas oscuras)", group: "marca", fallback: "#08301f" },
  { id: "brote", label: "Limón", group: "acentos", fallback: "#9fd356" },
  { id: "celeste", label: "Celeste lago", group: "acentos", fallback: "#1aa7d8" },
  { id: "celeste-200", label: "Celeste claro", group: "acentos", fallback: "#bfe9f5" },
  { id: "celeste-50", label: "Celeste muy claro", group: "acentos", fallback: "#ebf8fc" },
  { id: "inti", label: "Amarillo del escudo (foco del teclado)", group: "acentos", fallback: "#ffd900" },
  { id: "exito", label: "Verde de confirmación", group: "acentos", fallback: "#1f7a3a" },
  { id: "cielo", label: "Fondo celeste", group: "fondos", fallback: "#eef8fa" },
  { id: "bruma", label: "Bordes suaves", group: "fondos", fallback: "#d5ebef" },
  { id: "niebla", label: "Bordes marcados", group: "fondos", fallback: "#b9d5da" },
  { id: "tinta", label: "Texto principal", group: "texto", fallback: "#13261f" },
  { id: "pizarra", label: "Texto secundario", group: "texto", fallback: "#4b5f58" },
] as const;

export type ThemeToken = (typeof THEME_TOKENS)[number]["id"];
export type Palette = Record<ThemeToken, string>;

export const DEFAULT_PALETTE = Object.fromEntries(THEME_TOKENS.map((t) => [t.id, t.fallback])) as Palette;

// ---------- tipografía ----------

/** Fuentes precargadas en el layout raíz (next/font); el panel elige cuál usa el sitio. */
export const FONTS = [
  { id: "kumbh", label: "Kumbh Sans", cssVar: "--font-kumbh", note: "La del portal munipuno.gob.pe" },
  { id: "nunito", label: "Nunito Sans", cssVar: "--font-nunito", note: "Redondeada y cercana" },
  { id: "source", label: "Source Sans 3", cssVar: "--font-source", note: "Sobria, muy legible en textos largos" },
  { id: "montserrat", label: "Montserrat", cssVar: "--font-montserrat", note: "Geométrica, de titulares fuertes" },
] as const;

export type FontId = (typeof FONTS)[number]["id"];

// ---------- identidad completa ----------

const hex = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^#[0-9a-f]{6}$/, "Usa un color en formato #RRGGBB.");
const text = (max: number) => z.string().trim().min(1, "No puede quedar vacío.").max(max, `Máximo ${max} caracteres.`);
const url = z.union([z.literal(""), z.url("Escribe un enlace completo, que empiece con https://").max(300)]);

export const identitySchema = z.object({
  institution: text(80),
  office: text(120),
  officeShort: text(20),
  description: text(300),
  contact: z.object({
    address: text(120),
    phone: text(30),
    extension: z.string().trim().max(10),
    serenazgo: z.string().trim().max(30),
    email: z.email("Escribe un correo válido."),
    hours: text(80),
  }),
  social: z.object({ facebook: url, instagram: url, tiktok: url }),
  links: z.object({ portal: url, transparency: url, tramite: url, gobpe: url }),
  palette: z.object(Object.fromEntries(THEME_TOKENS.map((t) => [t.id, hex])) as Record<ThemeToken, typeof hex>),
  font: z.enum(FONTS.map((f) => f.id) as [FontId, ...FontId[]]),
});

export type Identity = z.infer<typeof identitySchema>;

const socialOf = (icon: string) => SITE.social.find((s) => s.icon === icon)?.href ?? "";

export const DEFAULT_IDENTITY: Identity = {
  institution: SITE.institution,
  office: SITE.office,
  officeShort: SITE.officeShort,
  description: SITE.description,
  contact: {
    address: SITE.contact.address,
    phone: SITE.contact.phone,
    extension: SITE.contact.extension,
    serenazgo: SITE.contact.serenazgo,
    email: SITE.contact.email,
    hours: SITE.contact.hours,
  },
  social: { facebook: socialOf("facebook"), instagram: socialOf("instagram"), tiktok: socialOf("tiktok") },
  links: { ...SITE.links },
  palette: DEFAULT_PALETTE,
  font: "kumbh",
};

/**
 * Une lo guardado con los valores de fábrica, campo por campo: un campo inválido o que no existía cuando
 * se guardó toma el valor de fábrica, en vez de tumbar la identidad completa.
 */
export function mergeIdentity(stored: unknown): Identity {
  if (!stored || typeof stored !== "object") return DEFAULT_IDENTITY;
  const s = stored as Record<string, unknown>;
  const pick = <K extends keyof Identity>(key: K): Identity[K] => {
    const base = DEFAULT_IDENTITY[key];
    const value = s[key];
    const shape = identitySchema.shape[key];
    if (base && typeof base === "object" && value && typeof value === "object") {
      const merged = { ...base } as Record<string, unknown>;
      const inner = (shape as unknown as z.ZodObject).shape as Record<string, z.ZodType>;
      for (const [k, v] of Object.entries(value)) {
        if (k in inner && inner[k].safeParse(v).success) merged[k] = inner[k].parse(v);
      }
      return merged as Identity[K];
    }
    const parsed = shape.safeParse(value);
    return parsed.success ? (parsed.data as Identity[K]) : base;
  };
  return Object.fromEntries((Object.keys(DEFAULT_IDENTITY) as (keyof Identity)[]).map((k) => [k, pick(k)])) as Identity;
}

/** "(051) 601000" → "tel:+5151601000" (código de Perú y número sin el 0 de larga distancia). */
export function telHref(phone: string) {
  const digits = phone.replace(/\D/g, "").replace(/^0/, "");
  return digits ? `tel:+51${digits}` : "";
}
