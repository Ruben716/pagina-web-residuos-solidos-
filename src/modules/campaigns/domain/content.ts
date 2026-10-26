import { z } from "zod";
import type { CollectionView } from "@/modules/content";
import { mediaRefSchema } from "@/modules/media";
import { CAMPAIGNS, type Campaign } from "../data";

export const CAMPAIGNS_KEY = "campaigns";

const req = (msg: string, max = 200) => z.string().trim().min(1, msg).max(max);
const opt = (max = 300) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || undefined);
// fecha y hora de Lima en ISO, como la guarda el editor ("2026-11-14T08:00:00-05:00")
const isoLima = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}-05:00$/, "Elige fecha y hora.");

export const campaignsSchema = z.array(
  z
    .object({
      slug: req("Falta el identificador.", 80),
      title: req("Escribe el nombre de la campaña."),
      kind: req("Escribe el tipo, p. ej. «Voluntariado».", 60),
      summary: req("Escribe una descripción corta.", 400),
      start: isoLima,
      end: isoLima.optional().or(z.literal("").transform(() => undefined)),
      place: req("Escribe el lugar."),
      goal: req("Escribe la meta."),
      audience: opt(),
      image: mediaRefSchema,
      result: opt(400),
    })
    .refine((c) => !c.end || c.end > c.start, { path: ["end"], message: "El fin debe ser después del inicio." }),
) satisfies z.ZodType<Campaign[]>;

export const CAMPAIGNS_VIEW: CollectionView = {
  key: CAMPAIGNS_KEY,
  title: "Campañas Sumaq Ayni",
  description: "Agenda de campañas. Las que ya pasaron se muestran solas en «Realizadas»; agrega su resultado cuando lo tengas.",
  itemName: "campaña",
  titleField: "title",
  subtitleField: "start",
  idField: "slug",
  where: "/campanas",
  blank: { title: "", kind: "Voluntariado", summary: "", start: "", place: "", goal: "", image: "sumaqAyni" },
  fields: [
    { type: "text", name: "title", label: "Nombre" },
    { type: "text", name: "kind", label: "Tipo", hint: "Voluntariado, Canje de reciclables, Educación ambiental…" },
    { type: "datetime", name: "start", label: "Inicio" },
    { type: "datetime", name: "end", label: "Fin", optional: true },
    { type: "text", name: "place", label: "Lugar" },
    { type: "text", name: "goal", label: "Meta" },
    { type: "text", name: "audience", label: "Dirigida a", optional: true },
    { type: "image", name: "image", label: "Foto" },
    { type: "textarea", name: "summary", label: "Descripción", rows: 3 },
    { type: "textarea", name: "result", label: "Resultado (cuando ya se realizó)", optional: true, rows: 3 },
  ],
};

export const CAMPAIGNS_DEFAULTS: Campaign[] = [...CAMPAIGNS];
