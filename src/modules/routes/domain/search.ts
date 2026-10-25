import type { CollectionRoute } from "./types";

/** Normaliza para buscar sin tildes, mayúsculas ni signos: "Jr. Tarapacá," ≈ "jr tarapaca". */
export const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

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
const OPTIONAL = new Set([
  "jiron",
  "avenida",
  "pasaje",
  "calle",
  "urbanizacion",
  "prolongacion",
  "de",
  "del",
  "la",
  "el",
  "los",
  "las",
  "y",
  "en",
  "a",
]);

/** Fonética del castellano andino para comparar: c/k/q, s/z, b/v, y/ll/i, h muda. */
const phonetic = (t: string) =>
  t
    .replace(/ch/g, "§")
    .replace(/h/g, "")
    .replace(/qu/g, "k")
    .replace(/q/g, "k")
    .replace(/c([aou])/g, "k$1")
    .replace(/c([ei])/g, "s$1")
    .replace(/c$/g, "k")
    .replace(/z/g, "s")
    .replace(/v/g, "b")
    .replace(/ll/g, "y")
    .replace(/([aeiou])i([aeiou])/g, "$1y$2")
    .replace(/(.)\1+/g, "$1")
    .replace(/§/g, "ch");

const tokens = (text: string) =>
  normalize(text)
    .split(" ")
    .filter(Boolean)
    .map((t) => CANON[t] ?? t);

/** Distancia de edición con transposiciones (Damerau–Levenshtein restringida), con tope para cortar pronto. */
function distance(a: string, b: string, max: number) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const prev2 = new Array<number>(b.length + 1).fill(0);
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
      cur[j] = v;
      rowMin = Math.min(rowMin, v);
    }
    if (rowMin > max) return max + 1;
    prev2.splice(0, prev2.length, ...prev);
    prev = cur;
  }
  return prev[b.length];
}

const tolerance = (len: number) => (len >= 8 ? 2 : len >= 4 ? 1 : 0);

/** Qué tan bien una palabra buscada coincide con una palabra del campo (0 = nada). */
function tokenScore(q: string, f: string): number {
  if (q === f) return 3;
  if (q.length >= 2 && f.startsWith(q)) return 2.5; // mientras escribe
  const qp = phonetic(q);
  const fp = phonetic(f);
  if (qp === fp) return 2.4;
  if (qp.length >= 3 && fp.startsWith(qp)) return 2;
  const tol = tolerance(q.length);
  if (!tol) return 0;
  if (distance(qp, fp, tol) <= tol) return 1.6;
  // error de tipeo en una palabra a medio escribir: compara con el comienzo de la palabra del campo
  if (q.length >= 5 && fp.length > qp.length && distance(qp, fp.slice(0, qp.length), tol) <= tol) return 1.2;
  return 0;
}

interface IndexedField {
  text: string;
  words: string[];
  /** palabras pegadas, para "huaynapucara" ≈ "Huayna Pucara" */
  joined: string;
}

type Searchable = Pick<CollectionRoute, "number" | "title" | "streets" | "landmarks">;

const index = new WeakMap<object, IndexedField[]>();
function fieldsOf(route: Searchable) {
  let f = index.get(route);
  if (!f) {
    f = [route.title, ...route.streets, ...route.landmarks].map((text) => {
      const words = tokens(text);
      return { text, words, joined: phonetic(words.join("")) };
    });
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
        let s = 0;
        for (const w of field.words) s = Math.max(s, tokenScore(q, w));
        if (s < 2 && q.length >= 5 && field.joined.includes(phonetic(q))) s = 2;
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
