/**
 * Comparación tolerante de textos en castellano: sin tildes ni signos, con fonética andina
 * (c/k/q, s/z, b/v, y/ll/i, h muda), prefijos mientras se escribe y errores de tipeo.
 * Código puro: lo usan los buscadores de rutas y de segregación.
 */

/** Normaliza para buscar sin tildes, mayúsculas ni signos: "Jr. Tarapacá," ≈ "jr tarapaca". */
export const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

/** Palabras normalizadas; `canon` reemplaza abreviaturas o variantes por una forma única. */
export const words = (text: string, canon: Readonly<Record<string, string>> = {}) =>
  normalize(text)
    .split(" ")
    .filter(Boolean)
    .map((t) => canon[t] ?? t);

/** Fonética del castellano andino para comparar: c/k/q, s/z, b/v, y/ll/i, h muda, letras dobles. */
export const phonetic = (t: string) =>
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

/** Distancia de edición con transposiciones (Damerau–Levenshtein restringida), con tope para cortar pronto. */
export function distance(a: string, b: string, max: number) {
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

/** Qué tan bien una palabra buscada coincide con una palabra del texto (0 = nada, 3 = idéntica). */
export function wordScore(q: string, f: string): number {
  if (q === f) return 3;
  if (q.length >= 2 && f.startsWith(q)) return 2.5; // mientras escribe
  const qp = phonetic(q);
  const fp = phonetic(f);
  if (qp === fp) return 2.4;
  if (qp.length >= 3 && fp.startsWith(qp)) return 2;
  const tol = tolerance(q.length);
  if (!tol) return 0;
  if (distance(qp, fp, tol) <= tol) return 1.6;
  // error de tipeo en una palabra a medio escribir: compara con el comienzo de la palabra del texto
  if (q.length >= 5 && fp.length > qp.length && distance(qp, fp.slice(0, qp.length), tol) <= tol) return 1.2;
  return 0;
}

/** Mejor coincidencia de una palabra buscada dentro de una lista de palabras (con palabras pegadas: "tetrapak" ≈ "tetra pak"). */
export function bestWordScore(q: string, fieldWords: readonly string[]) {
  let s = 0;
  for (const w of fieldWords) s = Math.max(s, wordScore(q, w));
  if (s < 2 && q.length >= 5 && phonetic(fieldWords.join("")).includes(phonetic(q))) s = 2;
  return s;
}

/** Artículos y preposiciones que no hace falta encontrar. */
export const STOPWORDS = new Set(["de", "del", "la", "el", "los", "las", "y", "en", "a", "un", "una", "con", "para", "por"]);
