import { z } from "zod";
import type { CollectionView } from "@/modules/content";
import { mediaRefSchema } from "@/modules/media";
import { SLIDES, type SlideData } from "../slides";

export const SLIDES_KEY = "home.slides";

const req = (msg: string, max = 200) => z.string().trim().min(1, msg).max(max);
/** enlace interno: una página ("/rutas") o una sección de la portada ("#gerencia") */
const href = z
  .string()
  .trim()
  .regex(/^[/#][\w\-/#]*$/, "Usa una dirección del sitio, p. ej. /rutas o #gerencia.");
const link = z.object({ href, label: req("Escribe el texto del botón.", 40) });

export const slidesSchema = z
  .array(
    z.object({
      id: req("Falta el identificador.", 60),
      badge: req("Escribe el rótulo corto.", 60),
      title: req("Escribe el titular.", 120),
      text: req("Escribe el texto.", 300),
      image: mediaRefSchema,
      focus: z
        .string()
        .trim()
        .max(20)
        .optional()
        .transform((v) => v || undefined),
      stats: z.array(z.object({ value: req("Escribe la cifra.", 20), label: req("Escribe qué indica.", 40) })).max(3, "Máximo 3 cifras."),
      cta: link,
      secondary: link.optional(),
    }),
  )
  .min(1, "Debe quedar al menos una diapositiva.")
  .max(6, "Máximo 6 diapositivas: más no se alcanzan a ver.") satisfies z.ZodType<SlideData[]>;

const FOCUS = [
  { value: "50% 50%", label: "Centro" },
  { value: "50% 30%", label: "Arriba" },
  { value: "50% 70%", label: "Abajo" },
  { value: "30% 50%", label: "Izquierda" },
  { value: "70% 50%", label: "Derecha" },
];

export const SLIDES_VIEW: CollectionView = {
  key: SLIDES_KEY,
  title: "Carrusel de la portada",
  description: "Las diapositivas que pasan solas al abrir el sitio. El rótulo corto también nombra la pestaña de cada una.",
  itemName: "diapositiva",
  titleField: "title",
  subtitleField: "badge",
  idField: "id",
  where: "/",
  blank: { badge: "", title: "", text: "", image: "titicacaBosque", stats: [], cta: { href: "/rutas", label: "" } },
  fields: [
    { type: "text", name: "badge", label: "Rótulo corto" },
    { type: "text", name: "title", label: "Titular" },
    { type: "textarea", name: "text", label: "Texto", rows: 3 },
    { type: "image", name: "image", label: "Foto de fondo" },
    { type: "select", name: "focus", label: "Encuadre de la foto", optional: true, options: FOCUS },
    {
      type: "list",
      name: "stats",
      label: "Cifras (hasta 3)",
      itemLabel: "cifra",
      max: 3,
      fields: [
        { type: "text", name: "value", label: "Cifra" },
        { type: "text", name: "label", label: "Qué indica" },
      ],
    },
    {
      type: "object",
      name: "cta",
      label: "Botón principal",
      fields: [
        { type: "text", name: "label", label: "Texto" },
        { type: "text", name: "href", label: "Lleva a", hint: "/rutas, /campanas, #gerencia…" },
      ],
    },
    {
      type: "object",
      name: "secondary",
      label: "Botón secundario",
      optional: true,
      fields: [
        { type: "text", name: "label", label: "Texto" },
        { type: "text", name: "href", label: "Lleva a" },
      ],
    },
  ],
};

export const SLIDES_DEFAULTS: SlideData[] = [...SLIDES];
