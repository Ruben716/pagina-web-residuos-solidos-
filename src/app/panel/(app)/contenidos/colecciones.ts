import "server-only";
import type { z } from "zod";
import { CAMPAIGNS_DEFAULTS, CAMPAIGNS_VIEW, campaignsSchema } from "@/modules/campaigns";
import type { CollectionView } from "@/modules/content";
import { FEED_FILTERS_DEFAULTS, FEED_FILTERS_VIEW, feedFiltersSchema } from "@/modules/facebook";
import { FAQ_DEFAULTS, FAQ_VIEW, faqSchema } from "@/modules/faq";
import { SLIDES_DEFAULTS, SLIDES_VIEW, slidesSchema } from "@/modules/home";
import {
  FIGURES_VIEW,
  figuresSchema,
  LINES_VIEW,
  linesSchema,
  MANAGEMENT_VIEW,
  managementSchema,
  OFFICE_DEFAULTS,
  SERVICES_VIEW,
  servicesSchema,
  SUBUNITS_VIEW,
  subunitsSchema,
} from "@/modules/office";
import { BINS, BINS_DEFAULTS, BINS_VIEW, binsSchema, ITEMS_DEFAULTS, ITEMS_VIEW, itemsSchema } from "@/modules/segregation";

type Item = Record<string, unknown>;

/**
 * Colecciones que se editan en Contenidos. Cada módulo define su esquema, su vista y sus datos de
 * fábrica; aquí solo se juntan para el panel (la única capa que conoce a todos los módulos).
 */
export interface Collection {
  view: CollectionView;
  schema: z.ZodType<readonly unknown[]>;
  defaults: readonly unknown[];
  group: string;
  /** otras etiquetas de caché que dependen de la colección (p. ej. el feed de Facebook) */
  tags?: readonly string[];
  /** datos solo para mostrar en el editor (el esquema los quita al guardar) */
  decorate?: (items: Item[]) => Item[];
}

const binName = (items: Item[]) => items.map((it) => ({ ...it, name: BINS.find((b) => b.id === it.id)?.name }));

export const COLLECTIONS: readonly Collection[] = [
  { group: "Portada", view: SLIDES_VIEW, schema: slidesSchema, defaults: SLIDES_DEFAULTS },
  { group: "Portada", view: SERVICES_VIEW, schema: servicesSchema, defaults: OFFICE_DEFAULTS.services },
  { group: "La gerencia", view: MANAGEMENT_VIEW, schema: managementSchema, defaults: OFFICE_DEFAULTS.management },
  { group: "La gerencia", view: SUBUNITS_VIEW, schema: subunitsSchema, defaults: OFFICE_DEFAULTS.subunits },
  { group: "La gerencia", view: LINES_VIEW, schema: linesSchema, defaults: OFFICE_DEFAULTS.lines },
  { group: "La gerencia", view: FIGURES_VIEW, schema: figuresSchema, defaults: OFFICE_DEFAULTS.figures },
  { group: "Segregación", view: BINS_VIEW, schema: binsSchema, defaults: BINS_DEFAULTS, decorate: binName },
  { group: "Segregación", view: ITEMS_VIEW, schema: itemsSchema, defaults: ITEMS_DEFAULTS },
  { group: "Participa", view: CAMPAIGNS_VIEW, schema: campaignsSchema, defaults: CAMPAIGNS_DEFAULTS },
  { group: "Participa", view: FAQ_VIEW, schema: faqSchema, defaults: FAQ_DEFAULTS },
  { group: "Actualidad", view: FEED_FILTERS_VIEW, schema: feedFiltersSchema, defaults: FEED_FILTERS_DEFAULTS, tags: ["facebook"] },
];

export const findCollection = (key: string) => COLLECTIONS.find((c) => c.view.key === key);

/** Elementos tal como los ve el editor. */
export const forEditor = (c: Collection, items: readonly unknown[]) => {
  const plain = structuredClone(items) as Item[];
  return c.decorate ? c.decorate(plain) : plain;
};
