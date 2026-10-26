import { z } from "zod";
import type { CollectionView } from "@/modules/content";
import { type Bin, BINS, type BinId, ITEM_EMOJI, ITEMS, type WasteItem } from "../data";

const BIN_IDS = BINS.map((b) => b.id) as [BinId, ...BinId[]];
const req = (msg: string, max = 200) => z.string().trim().min(1, msg).max(max);
const textLines = (max = 120) =>
  z
    .array(z.string())
    .transform((a) =>
      a
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 30),
    )
    .pipe(z.array(z.string().max(max)));

// ---------- objetos de "¿Dónde va esto?" y del juego ----------

export const ITEMS_KEY = "segregation.items";

export const itemsSchema = z
  .array(
    z.object({
      name: req("Escribe el nombre del objeto.", 80),
      bin: z.enum(BIN_IDS, "Elige el color."),
      note: z
        .string()
        .trim()
        .max(200)
        .optional()
        .transform((v) => v || undefined),
      aliases: textLines(60)
        .optional()
        .transform((v) => (v?.length ? v : undefined)),
      emoji: z
        .string()
        .trim()
        .max(8)
        .optional()
        .transform((v) => v || undefined),
    }),
  )
  .min(4, "Deja al menos 4 objetos: el juego usa uno de cada color.")
  .refine(
    (items) => BIN_IDS.every((id) => items.some((i) => i.bin === id)),
    "Debe haber al menos un objeto de cada color (lo usa el juego).",
  ) satisfies z.ZodType<WasteItem[]>;

export const ITEMS_VIEW: CollectionView = {
  key: ITEMS_KEY,
  title: "Objetos de segregación",
  description: "El índice «¿Dónde va esto?» y el juego «¿En qué bolsa va?» de la página Segregación. Se ordenan solos de la A a la Z.",
  itemName: "objeto",
  titleField: "name",
  subtitleField: "bin",
  where: "/segregacion#buscador",
  blank: { name: "", bin: "aprovechable" },
  fields: [
    { type: "text", name: "name", label: "Nombre del objeto" },
    { type: "select", name: "bin", label: "Va en la bolsa", options: BINS.map((b) => ({ value: b.id, label: `${b.color} · ${b.name}` })) },
    { type: "text", name: "emoji", label: "Emoji (para el juego)", optional: true, hint: "Uno solo, p. ej. 🧴" },
    { type: "textarea", name: "note", label: "Indicación", optional: true, rows: 2, hint: "Por ejemplo «Enjuagado y aplastado»." },
    {
      type: "lines",
      name: "aliases",
      label: "Otros nombres",
      optional: true,
      hint: "Uno por línea: como la gente lo busca (pet, botella, gaseosa…).",
    },
  ],
};

export const ITEMS_DEFAULTS: WasteItem[] = ITEMS.map((i) => ({ ...i, emoji: ITEM_EMOJI[i.name] }));

// ---------- textos de los cuatro colores ----------

/** De cada color solo se editan los textos: el color, su código y los días de recojo son fijos. */
export const BINS_KEY = "segregation.bins";

type BinText = Pick<Bin, "id" | "container" | "schedule" | "summary" | "examples" | "tip">;

export const binsSchema = z
  .array(
    z.object({
      id: z.enum(BIN_IDS),
      container: req("Escribe el recipiente.", 60),
      schedule: req("Escribe cuándo se entrega.", 160),
      summary: req("Escribe la descripción.", 400),
      examples: textLines(80).pipe(z.array(z.string()).min(1, "Agrega al menos un ejemplo.")),
      tip: req("Escribe el consejo.", 300),
    }),
  )
  .length(BINS.length) satisfies z.ZodType<BinText[]>;

export const BINS_VIEW: CollectionView = {
  key: BINS_KEY,
  title: "Los cuatro colores",
  description: "Los textos de cada color en la página Segregación. El color, su norma y los días de recojo no se cambian aquí.",
  itemName: "color",
  titleField: "name",
  subtitleField: "container",
  fixed: true,
  where: "/segregacion#colores",
  blank: {},
  fields: [
    { type: "text", name: "container", label: "Recipiente" },
    { type: "text", name: "schedule", label: "Cuándo se entrega" },
    { type: "textarea", name: "summary", label: "Descripción", rows: 3 },
    { type: "lines", name: "examples", label: "Ejemplos", hint: "Uno por línea." },
    { type: "textarea", name: "tip", label: "Consejo", rows: 2 },
  ],
};

/** Los colores con sus textos editados encima. */
export const mergeBins = (texts: readonly BinText[] | null): Bin[] =>
  BINS.map((b) => ({ ...b, ...(texts?.find((t) => t.id === b.id) ?? {}) }));

export const BINS_DEFAULTS: BinText[] = BINS.map(({ id, container, schedule, summary, examples, tip }) => ({
  id,
  container,
  schedule,
  summary,
  examples: [...examples],
  tip,
}));
