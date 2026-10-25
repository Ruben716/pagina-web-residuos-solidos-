import { bestWordScore, normalize, STOPWORDS, words as wordsOf } from "@/shared/lib/fuzzy";
import type { CollectionRoute } from "./types";

export { normalize };

/* ------------------------------------------------------------------
   Buscador tolerante de calles, barrios y lugares
   ------------------------------------------------------------------ */

// Abreviaturas y variantes de tipos de vía y lugares
const CANON: Record<string, string> = {
  jr: "jiron",
  jiron: "jiron",
  jir: "jiron",
  av: "avenida",
  avda: "avenida",
  avenida: "avenida",
  psje: "pasaje",
  pje: "pasaje",
  pasaje: "pasaje",
  cl: "calle",
  calle: "calle",
  urb: "urbanizacion",
  urbanizacion: "urbanizacion",
  pq: "parque",
  parque: "parque",
  plz: "plaza",
  pza: "plaza",
  plaza: "plaza",
  prol: "prolongacion",
  prolongacion: "prolongacion",
  mz: "manzana",
  manzana: "manzana",
  ie: "colegio",
  colegio: "colegio",
  mcdo: "mercado",
  mercado: "mercado",
  cc: "comunidad",
  comunidad: "comunidad",
};

// No hace falta escribirlas: "lima" encuentra "Jr. Lima" y "calle lima" también.
const OPTIONAL = new Set(["jiron", "avenida", "pasaje", "calle", "urbanizacion", "prolongacion", ...STOPWORDS]);

const tokens = (text: string) => wordsOf(text, CANON);

interface IndexedField {
  text: string;
  words: string[];
}

type Searchable = Pick<CollectionRoute, "number" | "title" | "streets" | "landmarks">;

const index = new WeakMap<object, IndexedField[]>();
function fieldsOf(route: Searchable) {
  let f = index.get(route);
  if (!f) {
    f = [route.title, ...route.streets, ...route.landmarks].map((text) => ({ text, words: tokens(text) }));
    index.set(route, f);
  }
  return f;
}

export interface RouteHit<T> {
  route: T;
  /** calle, barrio o lugar donde se encontró (null si fue por número o por el nombre de la ruta) */
  field: string | null;
  score: number;
}

/**
 * Busca rutas por número, nombre, calle, barrio o lugar de referencia, tolerando abreviaturas,
 * signos, errores de tipeo y el orden de las palabras. Devuelve las rutas ordenadas por relevancia.
 */
export function findRoutes<T extends Searchable>(routes: readonly T[], query: string): RouteHit<T>[] {
  // nombres populares de lugares: se busca también con el nombre que figura en el inventario
  const alias = ALIASES.find(([popular]) => normalize(query).includes(popular));
  if (alias) {
    const merged = new Map<T, RouteHit<T>>();
    for (const h of [...findRouteHits(routes, normalize(query).replace(alias[0], alias[1])), ...findRouteHits(routes, query)]) {
      if (!merged.has(h.route) || merged.get(h.route)!.score < h.score) merged.set(h.route, h);
    }
    return [...merged.values()].sort((a, b) => b.score - a.score || a.route.number - b.route.number);
  }
  return findRouteHits(routes, query);
}

// [como lo dice la gente, como figura en el inventario de rutas]
const ALIASES: readonly [string, string][] = [
  ["plaza de armas de puno", "plaza mayor"],
  ["plaza de armas puno", "plaza mayor"],
  ["plaza de armas", "plaza mayor"],
  ["una puno", "ciudad universitaria"],
  ["universidad del altiplano", "ciudad universitaria"],
  ["terminal", "terminal terrestre"],
  ["estadio", "estadio torres belon"],
];

function findRouteHits<T extends Searchable>(routes: readonly T[], query: string): RouteHit<T>[] {
  const all = tokens(query);
  if (!all.length) return routes.map((route) => ({ route, field: null, score: 0 }));

  // "5", "05", "ruta 5", "r5", "ruta05"
  const num = normalize(query).match(/^(?:ruta\s*|r\s*)?0*(\d{1,2})$/);
  if (num) {
    const exact = routes.filter((r) => r.number === Number(num[1]));
    if (exact.length) return exact.map((route) => ({ route, field: null, score: 10 }));
  }

  const required = all.filter((t) => !OPTIONAL.has(t));
  const words = required.length ? required : all;

  const hits: RouteHit<T>[] = [];
  for (const route of routes) {
    const fields = fieldsOf(route);
    let total = 0;
    let missing = false;
    const perField = new Map<IndexedField, number>();

    for (const q of words) {
      let best = 0;
      let bestField: IndexedField | null = null;
      for (const field of fields) {
        const s = bestWordScore(q, field.words);
        if (s > best) {
          best = s;
          bestField = field;
        }
      }
      if (!best || !bestField) {
        missing = true;
        break;
      }
      total += best;
      perField.set(bestField, (perField.get(bestField) ?? 0) + best);
    }
    if (missing) continue;

    // el campo que reúne más coincidencias es el que se muestra; el nombre de la ruta pesa un poco más
    const [shown] = [...perField.entries()].sort((a, b) => b[1] - a[1])[0];
    const isTitle = shown.text === route.title;
    // las palabras opcionales que sí coinciden con el campo mostrado suman un poco ("jr lima" prefiere "Jr. Lima")
    const bonus = all.filter((t) => OPTIONAL.has(t) && shown.words.includes(t)).length * 0.3;
    hits.push({ route, field: isTitle ? null : shown.text, score: total / words.length + (isTitle ? 0.2 : 0) + bonus });
  }

  return hits.sort((a, b) => b.score - a.score || a.route.number - b.route.number);
}

/** Atajo: sólo las rutas, en orden de relevancia. */
export function searchRoutes<T extends Searchable>(routes: readonly T[], query: string): readonly T[] {
  return findRoutes(routes, query).map((h) => h.route);
}
