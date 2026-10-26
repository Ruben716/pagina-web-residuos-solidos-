import { CONTROL_TAGS, DEFAULT_FILTERS, type FeedFilters } from "./config";
import type { FacebookPost, PostPhoto } from "./types";

interface GraphImage {
  src: string;
  width?: number;
  height?: number;
}

interface GraphAttachment {
  type?: string;
  media_type?: string;
  media?: { image?: GraphImage };
  subattachments?: { data?: GraphAttachment[] };
}

export interface GraphPost {
  id: string;
  message?: string;
  created_time: string;
  permalink_url?: string;
  full_picture?: string;
  attachments?: { data?: GraphAttachment[] };
}

const HEADLINE_MAX = 160;

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Oculta si coincide el ID (completo o la parte tras "_"), el último tramo del enlace, o lleva el hashtag. */
function isHidden(raw: GraphPost, text: string, { hideTag, hiddenPosts }: FeedFilters) {
  if (hideTag && text.toLowerCase().includes(hideTag.toLowerCase())) return true;
  const keys = [raw.id, raw.id.split("_").pop()];
  if (raw.permalink_url) keys.push(URL.parse(raw.permalink_url)?.pathname.split("/").filter(Boolean).pop());
  return hiddenPosts.some((h) => keys.some((k) => k && (h === k || h.includes(`/${k}`))));
}

/**
 * Solo imágenes servidas por Facebook (next.config permite *.fbcdn.net). Un enlace compartido trae la foto
 * del medio original (RPP, BBC…); para esos se usa `full_picture`, la copia que guarda Facebook.
 */
export const fromFacebook = (src?: string) => !!src && !!URL.parse(src)?.hostname.endsWith(".fbcdn.net");

/** Fotos del álbum si la publicación tiene varias; si no, la imagen adjunta o la principal. */
function collectPhotos(raw: GraphPost): PostPhoto[] {
  const attachment = raw.attachments?.data?.[0];
  const items = attachment?.subattachments?.data?.length ? attachment.subattachments.data : attachment ? [attachment] : [];
  const photos = items.flatMap((a) => (fromFacebook(a.media?.image?.src) ? [{ ...a.media!.image! }] : []));
  if (!photos.length && fromFacebook(raw.full_picture)) photos.push({ src: raw.full_picture! });
  return photos;
}

/** Convierte una publicación de la Graph API en una noticia; null si no debe salir en la web. */
export function toPost(raw: GraphPost, filters: FeedFilters = DEFAULT_FILTERS): FacebookPost | null {
  const message = (raw.message ?? "").trim();
  if (isHidden(raw, message, filters)) return null;

  // Facebook devuelve "+0000"; el ISO estándar es "+00:00"
  const date = raw.created_time.replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
  if (filters.since && date.slice(0, 10) < filters.since) return null;

  const text = CONTROL_TAGS.reduce((t, tag) => t.replace(new RegExp(`${escapeRe(tag)}\\b`, "gi"), ""), message)
    .replace(/[ \t]+\n/g, "\n")
    .trim();
  const photos = collectPhotos(raw);
  if (!text && !photos.length) return null;

  const [first = "", ...rest] = text.split("\n");
  const headline = first.trim() && first.length <= HEADLINE_MAX ? first.trim() : null;

  return {
    id: raw.id,
    date,
    headline,
    body: (headline ? rest.join("\n") : text).trim(),
    link: raw.permalink_url ?? `https://www.facebook.com/${raw.id}`,
    photos,
    video: raw.attachments?.data?.[0]?.media_type === "video",
  };
}

export const toPosts = (data: readonly GraphPost[], filters: FeedFilters = DEFAULT_FILTERS) =>
  data.flatMap((raw) => toPost(raw, filters) ?? []);
