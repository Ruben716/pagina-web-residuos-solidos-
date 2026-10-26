import { eq } from "drizzle-orm";
import { getDb } from "@/shared/server/db";
import { SLUG_PATTERN } from "../domain/article";
import { SEED_ARTICLES } from "../seed";
import { newsArticles } from "./schema";

/**
 * Direcciones de las notas publicadas, para que el proxy responda 404 a las que no existen (ver
 * src/proxy.ts). El proxy no tiene la caché de Next, así que se guardan en memoria del proceso
 * (globalThis: el proxy y las páginas pueden cargar este archivo por separado) unos segundos, y el
 * panel las olvida al guardar una nota.
 */
const TTL_MS = 30_000;
const store = globalThis as typeof globalThis & { __newsSlugs?: { slugs: Promise<Set<string>>; at: number } | null };

async function load() {
  try {
    const rows = await (await getDb()).select({ slug: newsArticles.slug }).from(newsArticles).where(eq(newsArticles.status, "published"));
    return new Set(rows.map((r) => r.slug));
  } catch (error) {
    console.error("[news] el proxy usa las notas iniciales:", error);
    store.__newsSlugs = null;
    return new Set(SEED_ARTICLES.map((a) => a.slug));
  }
}

export async function isPublishedSlug(slug: string) {
  if (!SLUG_PATTERN.test(slug)) return false;
  const memo = store.__newsSlugs;
  if (!memo || Date.now() - memo.at > TTL_MS) store.__newsSlugs = { slugs: load(), at: Date.now() };
  return (await store.__newsSlugs!.slugs).has(slug);
}

export function forgetPublishedSlugs() {
  store.__newsSlugs = null;
}
