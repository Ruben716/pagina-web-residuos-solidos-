import "server-only";
import { readContentDoc } from "@/modules/content";
import { checkValue, type CopyOf, entries, unflatten } from "../domain/define";
import { COPY_PAGES, copyDocKey, type CopyPageKey } from "../domain/registry";

type Page<K extends CopyPageKey> = CopyOf<(typeof COPY_PAGES)[K]>;

/** Solo los textos cambiados que siguen siendo válidos para la definición actual de la página. */
export function validOverrides(page: CopyPageKey, raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object") return {};
  const saved = raw as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const entry of entries(COPY_PAGES[page])) {
    const value = checkValue(entry, saved[entry.key]);
    if (value !== null && value !== entry.value) out[entry.key] = value;
  }
  return out;
}

/**
 * Textos vigentes de una página: los de fábrica con los cambios del panel encima. Cada texto se valida
 * por separado: si uno guardado ya no sirve (p. ej. cambió su largo máximo), vuelve al de fábrica.
 */
export async function getPageCopy<K extends CopyPageKey>(page: K): Promise<Page<K>> {
  const def = COPY_PAGES[page];
  const overrides = validOverrides(page, await readContentDoc(copyDocKey(page)));
  const values = Object.fromEntries(entries(def).map((e) => [e.key, overrides[e.key] ?? e.value]));
  return unflatten(def, values) as Page<K>;
}

/** Título de la pestaña y descripción de una página, para su generateMetadata. */
export async function getPageMetadata(page: CopyPageKey) {
  const { seo } = (await getPageCopy(page)) as { seo?: { title: string; description: string } };
  return seo ? { title: seo.title, description: seo.description } : {};
}
