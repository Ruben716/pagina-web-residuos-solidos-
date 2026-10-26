import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { SITE } from "@/shared/config/site";
import { POST_LIMIT } from "./config";
import { fromFacebook, type GraphPost, toPosts } from "./parse";
import type { FacebookFeed, FacebookPage, FacebookPost } from "./types";

const GRAPH_VERSION = "v26.0";
const FIELDS = "id,message,created_time,permalink_url,full_picture,attachments{type,media_type,media,subattachments.limit(20){type,media}}";

/** Última respuesta buena: si Facebook falla, se sigue mostrando esto (como la caché del PHP original). */
let lastGood: { posts: FacebookPost[]; page: FacebookPage | null } | null = null;

async function graph<T>(path: string, params: Record<string, string>, token: string): Promise<T> {
  const base = process.env.FACEBOOK_GRAPH_URL ?? "https://graph.facebook.com";
  const url = new URL(`${base}/${GRAPH_VERSION}/${path}`);
  url.search = new URLSearchParams({ ...params, access_token: token }).toString();
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  const body = await res.json().catch(() => null);
  // el mensaje de error de Facebook no incluye el token; la URL sí, por eso no se registra
  if (!res.ok || !body || body.error) throw new Error(`Graph API ${res.status}: ${body?.error?.message ?? "respuesta inesperada"}`);
  return body as T;
}

async function fetchPosts(page: string, token: string) {
  const body = await graph<{ data?: GraphPost[] }>(`${page}/posts`, { fields: FIELDS, limit: String(POST_LIMIT) }, token);
  if (!Array.isArray(body.data)) throw new Error("Graph API: respuesta sin publicaciones");
  return toPosts(body.data);
}

/** Nombre, seguidores y foto de la página. Si falla, la sección funciona igual sin la tarjeta. */
async function fetchPage(page: string, token: string): Promise<FacebookPage | null> {
  try {
    const body = await graph<{
      id?: string;
      name?: string;
      link?: string;
      followers_count?: number;
      fan_count?: number;
      picture?: { data?: { url?: string } };
    }>(page, { fields: "id,name,link,followers_count,fan_count,picture.type(large){url}" }, token);
    if (!body.name) return null;
    const picture = body.picture?.data?.url;
    return {
      name: body.name,
      followers: body.followers_count ?? body.fan_count ?? null,
      picture: fromFacebook(picture) ? picture! : null,
      link: body.link ?? (body.id ? `https://www.facebook.com/${body.id}` : null),
    };
  } catch {
    return null;
  }
}

/**
 * Publicaciones de la página de Facebook de la gerencia. Se consulta a Facebook como mucho una vez
 * por hora; el token vive solo en el servidor (FACEBOOK_PAGE_TOKEN) y nunca llega al navegador.
 */
export async function getFacebookFeed(): Promise<FacebookFeed> {
  "use cache";
  cacheTag("facebook");
  const token = process.env.FACEBOOK_PAGE_TOKEN;
  // el botón "Seguir" lleva a FACEBOOK_PAGE_URL, si no a la página de la que salen las publicaciones,
  // y si tampoco se sabe, al Facebook municipal
  const pageUrlFor = (page: FacebookPage | null) =>
    process.env.FACEBOOK_PAGE_URL || page?.link || SITE.social.find((s) => s.icon === "facebook")!.href;
  // con un token de página, "me" es la propia página
  const pageId = process.env.FACEBOOK_PAGE_ID || "me";

  if (!token) {
    cacheLife("minutes");
    return { status: "sin-configurar", posts: [], page: null, pageUrl: pageUrlFor(null) };
  }
  try {
    const [posts, page] = await Promise.all([fetchPosts(pageId, token), fetchPage(pageId, token)]);
    lastGood = { posts, page };
    cacheLife("hours");
    return { status: "ok", posts, page, pageUrl: pageUrlFor(page) };
  } catch (error) {
    console.error("[facebook] no se pudieron leer las publicaciones:", error instanceof Error ? error.message : error);
    // se reintenta en minutos, no en una hora
    cacheLife("minutes");
    return lastGood
      ? { status: "ok", ...lastGood, pageUrl: pageUrlFor(lastGood.page) }
      : { status: "error", posts: [], page: null, pageUrl: pageUrlFor(null) };
  }
}
