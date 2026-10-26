import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { DatabaseUnavailableError, getDb } from "@/shared/server/db";
import { contentDocs } from "./schema";

export const contentTag = (key: string) => `content:${key}`;

export class VersionConflictError extends Error {
  constructor() {
    super("Alguien más guardó cambios en esta colección mientras la editabas. Recarga la página para ver su versión.");
  }
}

/**
 * Documento publicado de una colección, o null si nunca se editó o la base no responde (entonces el
 * módulo usa sus datos de fábrica). Queda en caché hasta que el panel lo cambia (updateTag(contentTag(key))).
 */
export async function readContentDoc(key: string): Promise<unknown> {
  "use cache";
  cacheTag(contentTag(key));
  try {
    const [row] = await (await getDb()).select({ value: contentDocs.value }).from(contentDocs).where(eq(contentDocs.key, key)).limit(1);
    cacheLife("max");
    return row?.value ?? null;
  } catch (error) {
    if (!(error instanceof DatabaseUnavailableError)) console.error(`[content] ${key}: se usan los datos de fábrica:`, error);
    cacheLife("minutes");
    return null;
  }
}

/** Para el editor del panel: sin caché, con versión y autoría. */
export async function readDocForEdit(key: string) {
  const [row] = await (await getDb()).select().from(contentDocs).where(eq(contentDocs.key, key)).limit(1);
  return row ? { value: row.value, version: row.version, updatedAt: row.updatedAt, updatedBy: row.updatedBy } : null;
}

/** Para el índice del panel: cuándo y quién publicó cada colección editada. */
export async function listDocMeta() {
  const rows = await (
    await getDb()
  )
    .select({ key: contentDocs.key, updatedAt: contentDocs.updatedAt, updatedBy: contentDocs.updatedBy })
    .from(contentDocs);
  return new Map(rows.map((r) => [r.key, r]));
}

/**
 * Guarda una nueva versión. `expectedVersion` es la que el editor cargó (0 si la colección nunca se
 * guardó): si en la base hay otra, alguien publicó en el medio y se rechaza.
 */
export async function saveContentDoc(key: string, value: unknown, expectedVersion: number, by: string) {
  const db = await getDb();
  if (expectedVersion === 0) {
    const inserted = await db
      .insert(contentDocs)
      .values({ key, value, updatedBy: by })
      .onConflictDoNothing()
      .returning({ key: contentDocs.key });
    if (!inserted.length) throw new VersionConflictError();
    return 1;
  }
  const updated = await db
    .update(contentDocs)
    .set({ value, version: expectedVersion + 1, updatedAt: new Date(), updatedBy: by })
    .where(and(eq(contentDocs.key, key), eq(contentDocs.version, expectedVersion)))
    .returning({ version: contentDocs.version });
  if (!updated.length) throw new VersionConflictError();
  return updated[0].version;
}

/** Claves de las colecciones publicadas que contienen exactamente este texto como valor (p. ej. "asset:<id>"). */
export async function docsContaining(value: string) {
  // con comillas: "asset:ab" no coincide con "asset:abc"
  const needle = JSON.stringify(value);
  const rows = await (
    await getDb()
  )
    .select({ key: contentDocs.key })
    .from(contentDocs)
    .where(sql`strpos(${contentDocs.value}::text, ${needle}) > 0`);
  return rows.map((r) => r.key);
}

/** Vuelve la colección a sus datos de fábrica (borra el documento). */
export async function deleteContentDoc(key: string) {
  await (await getDb()).delete(contentDocs).where(eq(contentDocs.key, key));
}
