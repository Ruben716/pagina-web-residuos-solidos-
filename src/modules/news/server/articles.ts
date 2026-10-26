import "server-only";
import { and, desc, eq, ne } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import type { MediaRef } from "@/modules/media";
import { DatabaseUnavailableError, getDb } from "@/shared/server/db";
import type { Article, ArticleInput, Category, Status } from "../domain/article";
import { SEED_ARTICLES } from "../seed";
import { type NewsRow, newsArticles } from "./schema";

export const NEWS_TAG = "news";

export class ArticleConflictError extends Error {
  constructor() {
    super("Alguien más guardó esta nota mientras la editabas. Recarga la página para ver su versión.");
  }
}

const toArticle = (r: NewsRow): Article => ({
  id: r.id,
  slug: r.slug,
  date: r.date,
  category: r.category as Category,
  title: r.title,
  excerpt: r.excerpt,
  body: r.body,
  image: r.image as MediaRef,
  source: r.sourceLabel && r.sourceUrl ? { label: r.sourceLabel, url: r.sourceUrl } : undefined,
  status: r.status as Status,
});

const columns = (a: ArticleInput) => ({
  slug: a.slug,
  title: a.title,
  excerpt: a.excerpt,
  body: a.body,
  category: a.category,
  image: a.image,
  date: a.date,
  sourceLabel: a.sourceLabel || null,
  sourceUrl: a.sourceUrl || null,
  status: a.status,
});

const newestFirst = [desc(newsArticles.date), desc(newsArticles.createdAt)];

/**
 * Notas publicadas, de la más reciente a la más antigua. Quedan en caché hasta que el panel guarda
 * una (updateTag(NEWS_TAG)); sin base de datos (p. ej. en el build) se usan las notas iniciales.
 */
export async function getArticles(): Promise<Article[]> {
  "use cache";
  cacheTag(NEWS_TAG);
  try {
    const rows = await (
      await getDb()
    )
      .select()
      .from(newsArticles)
      .where(eq(newsArticles.status, "published"))
      .orderBy(...newestFirst);
    cacheLife("max");
    return rows.map(toArticle);
  } catch (error) {
    if (!(error instanceof DatabaseUnavailableError)) console.error("[news] se usan las notas iniciales:", error);
    cacheLife("minutes");
    return [...SEED_ARTICLES];
  }
}

export async function getArticle(slug: string) {
  return (await getArticles()).find((a) => a.slug === slug);
}

// ---------- panel (sin caché) ----------

export async function listAllArticles() {
  const rows = await (
    await getDb()
  )
    .select()
    .from(newsArticles)
    .orderBy(...newestFirst);
  return rows.map((r) => ({ ...toArticle(r), updatedAt: r.updatedAt, updatedBy: r.updatedBy }));
}

export async function findArticle(id: string) {
  const [row] = await (await getDb()).select().from(newsArticles).where(eq(newsArticles.id, id)).limit(1);
  return row ? { article: toArticle(row), version: row.version, updatedAt: row.updatedAt, updatedBy: row.updatedBy } : null;
}

export async function slugTaken(slug: string, exceptId?: string) {
  const where = exceptId ? and(eq(newsArticles.slug, slug), ne(newsArticles.id, exceptId)) : eq(newsArticles.slug, slug);
  const [row] = await (await getDb()).select({ id: newsArticles.id }).from(newsArticles).where(where).limit(1);
  return Boolean(row);
}

export async function insertArticle(input: ArticleInput, by: string) {
  const [row] = await (
    await getDb()
  )
    .insert(newsArticles)
    .values({ ...columns(input), updatedBy: by })
    .returning({ id: newsArticles.id });
  return row.id;
}

/** Guarda si nadie cambió la nota desde `expectedVersion`; devuelve la versión nueva. */
export async function updateArticle(id: string, input: ArticleInput, expectedVersion: number, by: string) {
  const [row] = await (
    await getDb()
  )
    .update(newsArticles)
    .set({ ...columns(input), version: expectedVersion + 1, updatedAt: new Date(), updatedBy: by })
    .where(and(eq(newsArticles.id, id), eq(newsArticles.version, expectedVersion)))
    .returning({ version: newsArticles.version });
  if (!row) throw new ArticleConflictError();
  return row.version;
}

export async function deleteArticleRow(id: string) {
  await (await getDb()).delete(newsArticles).where(eq(newsArticles.id, id));
}
