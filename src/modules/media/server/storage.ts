import "server-only";
import { createReadStream } from "node:fs";
import { mkdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import sharp from "sharp";
import { DATA_DIR } from "@/shared/server/paths";
import { MAX_SIDE } from "../domain/upload";

/**
 * Almacenamiento de las imágenes subidas en DATA_DIR/media (en Docker, el volumen de datos).
 * Si más adelante se usa S3 o similar, solo cambia este archivo.
 */

const ROOT = path.join(DATA_DIR, "media");
const NAME = /^[0-9a-f-]{36}\.webp$/;

export const isStoredName = (name: string) => NAME.test(name);

/**
 * Normaliza la imagen: la gira según su EXIF (fotos de celular), la reduce a MAX_SIDE, la pasa a WebP y
 * descarta los metadatos (incluida la ubicación GPS de la foto).
 */
export async function storeImage(input: Buffer) {
  const { data, info } = await sharp(input, { failOn: "error", limitInputPixels: 60_000_000 })
    .rotate()
    .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80, effort: 4 })
    .toBuffer({ resolveWithObject: true });

  const file = `${crypto.randomUUID()}.webp`;
  await mkdir(ROOT, { recursive: true });
  await writeFile(path.join(ROOT, file), data);
  return { file, width: info.width, height: info.height, bytes: data.length };
}

export async function openImage(name: string) {
  if (!isStoredName(name)) return null;
  const file = path.join(ROOT, name);
  try {
    const { size } = await stat(file);
    return { size, body: Readable.toWeb(createReadStream(file)) as ReadableStream };
  } catch {
    return null;
  }
}

export async function removeImage(name: string) {
  if (isStoredName(name)) await rm(path.join(ROOT, name), { force: true });
}
