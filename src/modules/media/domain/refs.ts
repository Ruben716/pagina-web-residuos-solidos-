import { z } from "zod";
import { MEDIA, type MediaKey } from "@/shared/content/media";

/**
 * Referencia a una imagen dentro del contenido: la clave de un espacio de fábrica ("recicladores") o una
 * imagen de la biblioteca ("asset:<uuid>"). Las páginas la resuelven con getSiteMedia(): media[ref].
 */
export type MediaRef = MediaKey | `asset:${string}`;

const ASSET = /^asset:[0-9a-f-]{36}$/;

export const isMediaRef = (value: string): value is MediaRef => value in MEDIA || ASSET.test(value);

export const mediaRefSchema = z.string().refine(isMediaRef, "Elige una imagen.") as unknown as z.ZodType<MediaRef>;

export const assetRef = (id: string): MediaRef => `asset:${id}`;

/** Imagen elegible en el contenido: de la biblioteca o una foto de fábrica del sitio. */
export interface ImageChoice {
  ref: string;
  src: string;
  alt: string;
  from: "biblioteca" | "sitio";
}
