import { bestWordScore, STOPWORDS, words } from "@/shared/lib/fuzzy";
import type { WasteItem } from "./data";

// variantes que la gente escribe y no se parecen lo suficiente para la fonética
const CANON: Record<string, string> = {
  tetrapack: "tetrapak",
  tetrabrik: "tetrapak",
  tecnoport: "tecnopor",
  teknopor: "tecnopor",
  descartables: "descartable",
};

const index = new WeakMap<WasteItem, string[][]>();
const fieldsOf = (item: WasteItem) => {
  let f = index.get(item);
  if (!f) {
    f = [item.name, ...(item.aliases ?? [])].map((t) => words(t, CANON));
    index.set(item, f);
  }
  return f;
};

/**
 * "¿Dónde va esto?" tolerante: sin tildes ni signos, en singular o plural, con errores de tipeo
 * ("botella platico", "tetrapack", "pila") y con nombres comunes ("caja de leche", "remedios").
 * Devuelve los objetos que coinciden, del más al menos parecido.
 */
export function findItems(items: readonly WasteItem[], query: string): WasteItem[] {
  const all = words(query, CANON);
  const q = all.filter((t) => !STOPWORDS.has(t));
  const wanted = q.length ? q : all;
  if (!wanted.length) return [...items];

  const scored: { item: WasteItem; score: number }[] = [];
  for (const item of items) {
    // cada palabra buscada debe aparecer en el nombre o en alguno de sus otros nombres ("cáscara de plátano")
    let total = 0;
    for (const w of wanted) {
      let s = 0;
      for (const field of fieldsOf(item)) s = Math.max(s, bestWordScore(w, field));
      if (!s) {
        total = 0;
        break;
      }
      total += s;
    }
    const best = total / wanted.length;
    if (best) scored.push({ item, score: best });
  }
  return scored.sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name, "es")).map((s) => s.item);
}
