import "server-only";
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { DatabaseUnavailableError, getDb } from "@/shared/server/db";
import { DEFAULT_IDENTITY, type Identity, mergeIdentity } from "../domain/identity";
import { siteSettings } from "./schema";

const KEY = "identity";
export const IDENTITY_TAG = "identity";

/**
 * Identidad vigente del sitio. Se lee una vez y queda en caché hasta que el panel la cambia
 * (updateTag(IDENTITY_TAG)); las páginas públicas no consultan la base de datos en cada visita.
 */
export async function getIdentity(): Promise<Identity> {
  "use cache";
  cacheTag(IDENTITY_TAG);
  try {
    const db = await getDb();
    const [row] = await db.select({ value: siteSettings.value }).from(siteSettings).where(eq(siteSettings.key, KEY)).limit(1);
    cacheLife("max");
    return mergeIdentity(row?.value);
  } catch (error) {
    if (!(error instanceof DatabaseUnavailableError)) console.error("[identity] se usan los valores de fábrica:", error);
    // sin base de datos: valores de fábrica, y se vuelve a intentar en minutos
    cacheLife("minutes");
    return DEFAULT_IDENTITY;
  }
}

/** Identidad guardada tal cual, sin caché (para el editor del panel). */
export async function readIdentityForEdit(): Promise<{ identity: Identity; updatedAt: Date | null; updatedBy: string | null }> {
  const db = await getDb();
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, KEY)).limit(1);
  return { identity: mergeIdentity(row?.value), updatedAt: row?.updatedAt ?? null, updatedBy: row?.updatedBy ?? null };
}

export async function saveIdentity(identity: Identity, by: string) {
  const db = await getDb();
  await db
    .insert(siteSettings)
    .values({ key: KEY, value: identity, updatedBy: by })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value: identity, updatedAt: new Date(), updatedBy: by } });
}
