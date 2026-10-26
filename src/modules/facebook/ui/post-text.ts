import { formatDate } from "@/shared/lib/format";
import type { FacebookPost } from "../types";

const EXCERPT_MAX = 140;

/** Nombre corto para lectores de pantalla y para el diálogo. */
export const labelOf = (p: FacebookPost) => p.headline ?? `Publicación del ${formatDate(p.date)}`;

/** Titular visible: el de la publicación, el inicio de su texto o, si es solo fotos, su fecha. */
export function titleOf(p: FacebookPost) {
  if (p.headline) return p.headline;
  if (!p.body) return labelOf(p);
  if (p.body.length <= EXCERPT_MAX) return p.body;
  return `${p.body.slice(0, EXCERPT_MAX).replace(/\s+\S*$/, "")}…`;
}

/** Etiqueta del tipo de publicación: video, álbum, foto o comunicado de solo texto. */
export function kindOf(p: FacebookPost) {
  if (p.video) return "Video";
  if (p.photos.length > 1) return `${p.photos.length} fotos`;
  return p.photos.length ? "Foto" : "Comunicado";
}
