import "server-only";
import { desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { MEDIA, type Media, type MediaKey } from "@/shared/content/media";
import { DatabaseUnavailableError, getDb } from "@/shared/server/db";
import type { ImageChoice, MediaRef } from "../domain/refs";
import { SLOTS } from "../domain/slots";
import type { AssetMeta } from "../domain/upload";
import { type AssetRow, mediaAssets, mediaSlots } from "./schema";

export const MEDIA_TAG = "media";

/** Espacios de fábrica (con sus reemplazos) y, además, cada imagen de la biblioteca como "asset:<id>". */
export type SiteMedia = Record<MediaRef, Media>;

/** URL pública de un archivo subido (la sirve app/medios/[file]/route.ts). */
export const assetSrc = (file: string) => `/medios/${file}`;

function toMedia(a: AssetRow): Media {
  return {
    src: assetSrc(a.file),
    alt: a.alt,
    width: a.width,
    height: a.height,
    credit: a.creditAuthor
      ? {
          author: a.creditAuthor,
          source: a.creditSource || "Municipalidad Provincial de Puno",
          url: a.creditUrl || "",
          license: a.creditLicense || "Todos los derechos reservados",
        }
      : undefined,
  };
}

/**
 * Imágenes vigentes del sitio: las de fábrica (registro MEDIA) con los reemplazos hechos en el panel.
 * Se lee una vez y queda en caché hasta que el panel cambia algo (updateTag(MEDIA_TAG)).
 */
export async function getSiteMedia(): Promise<SiteMedia> {
  "use cache";
  cacheTag(MEDIA_TAG);
  try {
    const db = await getDb();
    const [slots, assets] = await Promise.all([db.select().from(mediaSlots), db.select().from(mediaAssets)]);
    const byId = new Map(assets.map((a) => [a.id, a]));
    const media: SiteMedia = { ...MEDIA };
    // las imágenes de la biblioteca, para el contenido que las usa directamente (notas, campañas…)
    for (const a of assets) media[`asset:${a.id}`] = toMedia(a);
    for (const { slot, assetId } of slots) {
      const asset = byId.get(assetId);
      if (asset && slot in MEDIA) media[slot as MediaKey] = toMedia(asset);
    }
    cacheLife("max");
    return media;
  } catch (error) {
    if (!(error instanceof DatabaseUnavailableError)) console.error("[media] se usan las imágenes de fábrica:", error);
    cacheLife("minutes");
    return MEDIA;
  }
}

/** Solo las imágenes que necesita un componente de cliente, para no enviar el catálogo entero al navegador. */
/** Imagen de una referencia; si apunta a una imagen de la biblioteca que ya no existe, una foto genérica del sitio. */
export const mediaFor = (media: SiteMedia, ref: MediaRef): Media => media[ref] ?? media.panorama;

export function pickMedia<K extends MediaRef>(media: SiteMedia, keys: readonly K[]): Record<K, Media> {
  return Object.fromEntries(keys.map((k) => [k, mediaFor(media, k)])) as Record<K, Media>;
}

// ---------- biblioteca (panel) ----------

export async function listAssets() {
  const db = await getDb();
  const [assets, slots] = await Promise.all([
    db.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt)),
    db.select().from(mediaSlots),
  ]);
  return assets.map((a) => ({
    ...a,
    src: assetSrc(a.file),
    usedIn: slots.filter((s) => s.assetId === a.id).map((s) => s.slot as MediaKey),
  }));
}

export type LibraryAsset = Awaited<ReturnType<typeof listAssets>>[number];

/** Imágenes que el editor de contenido puede elegir: la biblioteca y las fotos del sitio (con sus reemplazos). */
export async function listImageChoices(): Promise<ImageChoice[]> {
  const [media, assets] = await Promise.all([getSiteMedia(), listAssets()]);
  return [
    ...assets.map((a) => ({ ref: `asset:${a.id}`, src: a.src, alt: a.alt, from: "biblioteca" as const })),
    ...(Object.keys(SLOTS) as MediaKey[]).map((k) => ({ ref: k, src: media[k].src, alt: SLOTS[k].label, from: "sitio" as const })),
  ];
}

export async function slotAssignments() {
  const db = await getDb();
  const rows = await db.select().from(mediaSlots);
  return new Map(rows.map((r) => [r.slot as MediaKey, r]));
}

const metaColumns = (meta: AssetMeta) => ({
  alt: meta.alt,
  creditAuthor: meta.creditAuthor || null,
  creditSource: meta.creditSource || null,
  creditUrl: meta.creditUrl || null,
  creditLicense: meta.creditLicense || null,
});

export async function insertAsset(
  values: { file: string; originalName: string; width: number; height: number; bytes: number; createdBy: string },
  meta: AssetMeta,
) {
  const [row] = await (
    await getDb()
  )
    .insert(mediaAssets)
    .values({ ...values, ...metaColumns(meta) })
    .returning();
  return row;
}

export async function updateAssetMeta(id: string, meta: AssetMeta) {
  await (await getDb()).update(mediaAssets).set(metaColumns(meta)).where(eq(mediaAssets.id, id));
}

export async function findAsset(id: string) {
  const [row] = await (await getDb()).select().from(mediaAssets).where(eq(mediaAssets.id, id)).limit(1);
  return row;
}

export async function deleteAssetRow(id: string) {
  await (await getDb()).delete(mediaAssets).where(eq(mediaAssets.id, id));
}

export async function isAssetInUse(id: string) {
  const [row] = await (await getDb()).select({ slot: mediaSlots.slot }).from(mediaSlots).where(eq(mediaSlots.assetId, id)).limit(1);
  return Boolean(row);
}

export async function setSlot(slot: MediaKey, assetId: string, by: string) {
  await (
    await getDb()
  )
    .insert(mediaSlots)
    .values({ slot, assetId, updatedBy: by })
    .onConflictDoUpdate({ target: mediaSlots.slot, set: { assetId, updatedAt: new Date(), updatedBy: by } });
}

export async function clearSlot(slot: MediaKey) {
  await (await getDb()).delete(mediaSlots).where(eq(mediaSlots.slot, slot));
}
