import { z } from "zod";
import { mediaRefSchema } from "@/modules/media";
import { type ArticleInput, CATEGORIES, SLUG_PATTERN, type Status, STATUSES } from "./article";

const req = (msg: string, max: number) => z.string().trim().min(1, msg).max(max, `Máximo ${max} caracteres.`);

/** Lo que envía el editor del panel. */
export const articleSchema = z
  .object({
    title: req("Escribe el titular.", 160),
    slug: z
      .string()
      .trim()
      .max(80, "Máximo 80 caracteres.")
      .regex(SLUG_PATTERN, "Solo minúsculas, números y guiones, p. ej. limpieza-en-laykakota."),
    date: z.iso.date("Elige la fecha de la nota."),
    category: z.enum(CATEGORIES, "Elige una categoría."),
    excerpt: req("Escribe la bajada: una o dos líneas que resumen la nota.", 300),
    body: req("Escribe el texto de la nota.", 20000),
    image: mediaRefSchema,
    sourceLabel: z.string().trim().max(80),
    sourceUrl: z.union([z.literal(""), z.url({ protocol: /^https?$/, error: "Pega el enlace completo, con https://" }).max(500)]),
    status: z.enum(Object.keys(STATUSES) as [Status, ...Status[]]),
  })
  .refine((a) => !a.sourceUrl || a.sourceLabel, { path: ["sourceLabel"], message: "Escribe el nombre de la fuente." })
  .refine((a) => !a.sourceLabel || a.sourceUrl, {
    path: ["sourceUrl"],
    message: "Pega el enlace de la fuente.",
  }) satisfies z.ZodType<ArticleInput>;
