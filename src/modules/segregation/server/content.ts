import "server-only";
import { parseDoc, readContentDoc } from "@/modules/content";
import { BINS_DEFAULTS, BINS_KEY, binsSchema, ITEMS_DEFAULTS, ITEMS_KEY, itemsSchema, mergeBins } from "../domain/content";

/** Colores (con sus textos editados) y objetos vigentes de la segregación. */
export async function getSegregationContent() {
  const [items, bins] = await Promise.all([readContentDoc(ITEMS_KEY), readContentDoc(BINS_KEY)]);
  return {
    items: parseDoc(items, itemsSchema, ITEMS_DEFAULTS),
    bins: mergeBins(parseDoc(bins, binsSchema, BINS_DEFAULTS)),
  };
}
