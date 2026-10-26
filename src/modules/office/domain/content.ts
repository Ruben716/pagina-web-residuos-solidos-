import { z } from "zod";
import type { CollectionView } from "@/modules/content";
import { mediaRefSchema } from "@/modules/media";
import type { IconName } from "@/shared/ui/icon";
import { FIGURES, type Figure, MANAGEMENT, OFFICE_SOURCES, PORTAL_LINKS, SUBUNITS, type Unit, WORK_LINES, type WorkLine } from "../data";

/** Colecciones de la gerencia: titular, subgerencias, líneas de trabajo, cifras e índice de servicios. */

const req = (msg: string, max = 200) => z.string().trim().min(1, msg).max(max);
const opt = (max = 120) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || undefined);
/** lista de textos editada línea por línea: se descartan las vacías */
const lines = (msg: string) =>
  z
    .array(z.string())
    .transform((a) => a.map((s) => s.trim()).filter(Boolean))
    .pipe(z.array(z.string().max(120)).min(1, msg));

/** íconos que tienen sentido para el contenido de la gerencia */
export const ICON_OPTIONS: readonly { value: IconName; label: string }[] = [
  { value: "home", label: "Casa / barrio" },
  { value: "truck", label: "Camión" },
  { value: "recycle", label: "Reciclaje" },
  { value: "leaf", label: "Hoja" },
  { value: "sprout", label: "Brote" },
  { value: "users", label: "Personas" },
  { value: "route", label: "Ruta" },
  { value: "pin", label: "Ubicación" },
  { value: "camera", label: "Cámara" },
  { value: "building", label: "Edificio" },
  { value: "scale", label: "Balanza" },
  { value: "shield", label: "Escudo" },
  { value: "calendar", label: "Calendario" },
  { value: "heart", label: "Corazón" },
  { value: "info", label: "Información" },
  { value: "alert", label: "Alerta" },
];
const iconSchema = z.enum(ICON_OPTIONS.map((i) => i.value) as [IconName, ...IconName[]], "Elige un ícono.");

/** páginas internas a las que puede apuntar un enlace del contenido */
export const PAGE_OPTIONS = [
  { value: "/rutas", label: "Rutas y horarios" },
  { value: "/segregacion", label: "Segregación" },
  { value: "/compostaje", label: "Compostaje" },
  { value: "/campanas", label: "Campañas Sumaq Ayni" },
  { value: "/actualidad", label: "Actualidad" },
  { value: "/noticias", label: "Notas de prensa" },
  { value: "/preguntas", label: "Preguntas frecuentes" },
  { value: "/reporta", label: "Reporta a tu vecino" },
  { value: "/reporta/seguimiento", label: "Seguimiento de reportes" },
] as const;
const pageSchema = z.enum(PAGE_OPTIONS.map((p) => p.value) as [string, ...string[]], "Elige una página.");

type SourceKey = keyof typeof OFFICE_SOURCES;
const SOURCE_KEYS = Object.keys(OFFICE_SOURCES) as [SourceKey, ...SourceKey[]];

// ---------- titular de la gerencia ----------

export type Management = Omit<Unit, "email" | "extension">;
export const MANAGEMENT_KEY = "office.management";
export const managementSchema = z
  .array(
    z.object({
      name: req("Escribe el nombre de la gerencia."),
      head: req("Escribe el nombre del titular."),
      role: req("Escribe el cargo.", 60),
    }),
  )
  .length(1) satisfies z.ZodType<Management[]>;
export const MANAGEMENT_VIEW: CollectionView = {
  key: MANAGEMENT_KEY,
  title: "Titular de la gerencia",
  description: "Encabeza el organigrama de la portada. El correo y el anexo son los de contacto (Identidad y colores).",
  itemName: "titular",
  titleField: "head",
  fixed: true,
  where: "/#organizacion",
  blank: {},
  fields: [
    { type: "text", name: "head", label: "Nombre del titular", hint: "Con su título, p. ej. «Lic. …»" },
    { type: "text", name: "role", label: "Cargo" },
    { type: "text", name: "name", label: "Nombre de la gerencia" },
  ],
};

// ---------- subgerencias ----------

export type Subunit = Unit & { summary: string };
export const SUBUNITS_KEY = "office.subunits";
export const subunitsSchema = z.array(
  z.object({
    name: req("Escribe el nombre de la subgerencia."),
    head: req("Escribe el nombre del titular."),
    role: req("Escribe el cargo.", 60),
    email: z.email("Escribe un correo válido."),
    extension: opt(10),
    summary: req("Describe en una frase qué hace.", 300),
  }),
) satisfies z.ZodType<Subunit[]>;
export const SUBUNITS_VIEW: CollectionView = {
  key: SUBUNITS_KEY,
  title: "Subgerencias",
  description: "Las unidades bajo la gerencia, en el organigrama de la portada.",
  itemName: "subgerencia",
  titleField: "name",
  subtitleField: "head",
  where: "/#organizacion",
  blank: { name: "", head: "", role: "Subgerente", email: "", summary: "" },
  fields: [
    { type: "text", name: "name", label: "Nombre de la subgerencia" },
    { type: "text", name: "head", label: "Titular" },
    { type: "text", name: "role", label: "Cargo" },
    { type: "email", name: "email", label: "Correo" },
    { type: "text", name: "extension", label: "Anexo", optional: true },
    { type: "textarea", name: "summary", label: "Qué hace", rows: 3 },
  ],
};

// ---------- líneas de trabajo ----------

export const LINES_KEY = "office.lines";
export const linesSchema = z
  .array(
    z.object({
      id: req("Falta el identificador.", 60),
      title: req("Escribe el título.", 80),
      unit: req("Escribe la unidad a cargo.", 120),
      text: req("Escribe la descripción.", 500),
      points: lines("Agrega al menos un punto."),
      image: mediaRefSchema,
      icon: iconSchema,
      link: z.object({ href: pageSchema, label: req("Escribe el texto del enlace.", 60) }).optional(),
    }),
  )
  .min(1, "Debe quedar al menos una línea de trabajo.") satisfies z.ZodType<WorkLine[]>;
export const LINES_VIEW: CollectionView = {
  key: LINES_KEY,
  title: "Líneas de trabajo",
  description: "Las pestañas de «Qué hacemos» en la portada, cada una con su foto.",
  itemName: "línea de trabajo",
  titleField: "title",
  subtitleField: "unit",
  idField: "id",
  where: "/#que-hacemos",
  blank: { title: "", unit: "", text: "", points: [], image: "equipoCampo", icon: "leaf" },
  fields: [
    { type: "text", name: "title", label: "Título" },
    { type: "text", name: "unit", label: "Unidad a cargo" },
    { type: "select", name: "icon", label: "Ícono", options: ICON_OPTIONS },
    { type: "image", name: "image", label: "Foto" },
    { type: "textarea", name: "text", label: "Descripción", rows: 3 },
    { type: "lines", name: "points", label: "Puntos destacados", hint: "Uno por línea. Se muestran como etiquetas." },
    {
      type: "object",
      name: "link",
      label: "Enlace a una página",
      optional: true,
      fields: [
        { type: "select", name: "href", label: "Página", options: PAGE_OPTIONS },
        { type: "text", name: "label", label: "Texto del enlace" },
      ],
    },
  ],
};

// ---------- cifras ----------

export const FIGURES_KEY = "office.figures";
export const figuresSchema = z.array(
  z.object({
    value: z.number("Escribe un número.").nonnegative(),
    prefix: opt(4),
    suffix: opt(6),
    label: req("Escribe qué mide la cifra.", 80),
    source: z.enum(SOURCE_KEYS, "Elige la fuente."),
  }),
) satisfies z.ZodType<Figure[]>;
export const FIGURES_VIEW: CollectionView = {
  key: FIGURES_KEY,
  title: "Puno en cifras",
  description: "Las cifras animadas de la portada. Cada una cita su fuente.",
  itemName: "cifra",
  titleField: "label",
  subtitleField: "value",
  where: "/#cifras-titulo",
  blank: { value: 0, label: "", source: "generacion" },
  fields: [
    { type: "number", name: "value", label: "Número" },
    { type: "text", name: "prefix", label: "Antes del número", optional: true, hint: "Por ejemplo «+»." },
    { type: "text", name: "suffix", label: "Después del número", optional: true, hint: "Por ejemplo « t» o « %»." },
    { type: "text", name: "label", label: "Qué mide" },
    {
      type: "select",
      name: "source",
      label: "Fuente",
      options: SOURCE_KEYS.map((k) => ({ value: k, label: OFFICE_SOURCES[k].label })),
    },
  ],
};

// ---------- índice de servicios ----------

export type PortalLink = (typeof PORTAL_LINKS)[number];
export const SERVICES_KEY = "office.services";
export const servicesSchema = z.array(
  z.object({
    href: pageSchema,
    title: req("Escribe el título.", 60),
    text: req("Escribe una frase.", 160),
    icon: iconSchema,
    image: mediaRefSchema,
  }),
) satisfies z.ZodType<PortalLink[]>;
export const SERVICES_VIEW: CollectionView = {
  key: SERVICES_KEY,
  title: "Índice de servicios",
  description: "«¿Qué necesitas hoy?» en la portada: cada fila lleva a una página del sitio.",
  itemName: "servicio",
  titleField: "title",
  subtitleField: "href",
  where: "/",
  blank: { href: "/rutas", title: "", text: "", icon: "route", image: "recoleccionSelectiva" },
  fields: [
    { type: "select", name: "href", label: "Página", options: PAGE_OPTIONS },
    { type: "text", name: "title", label: "Título" },
    { type: "select", name: "icon", label: "Ícono", options: ICON_OPTIONS },
    { type: "image", name: "image", label: "Foto (se asoma al pasar el cursor)" },
    { type: "textarea", name: "text", label: "Descripción", rows: 2 },
  ],
};

export const OFFICE_DEFAULTS = {
  management: [MANAGEMENT] as Management[],
  subunits: [...SUBUNITS] as Subunit[],
  lines: [...WORK_LINES] as WorkLine[],
  figures: [...FIGURES] as Figure[],
  services: [...PORTAL_LINKS] as PortalLink[],
};
