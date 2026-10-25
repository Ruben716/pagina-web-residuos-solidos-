import type { CollectionRoute } from "./types";

/** Normaliza para buscar sin tildes ni mayúsculas: "Jr. Tarapacá" ≈ "tarapaca". */
export const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

type Searchable = Pick<CollectionRoute, "number" | "title" | "streets" | "landmarks">;

export function searchRoutes<T extends Searchable>(routes: readonly T[], query: string): readonly T[] {
  const q = normalize(query);
  if (!q) return routes;
  return routes.filter((r) => [r.title, `ruta ${r.number}`, ...r.streets, ...r.landmarks].some((field) => normalize(field).includes(q)));
}
