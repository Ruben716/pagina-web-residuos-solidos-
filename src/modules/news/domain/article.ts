// Sin dependencias de servidor: lo usa también el editor del panel (cliente).
import type { MediaRef } from "@/modules/media";

export const CATEGORIES = ["Intervención", "Infraestructura", "Campaña", "Orientación"] as const;
export type Category = (typeof CATEGORIES)[number];

export const STATUSES = { draft: "Borrador", published: "Publicada" } as const;
export type Status = keyof typeof STATUSES;

/** Nota de prensa tal como la usan el sitio y el panel. `body` es texto con formato simple (ver markdown.ts). */
export interface Article {
  id: string;
  slug: string;
  date: string;
  category: Category;
  title: string;
  excerpt: string;
  body: string;
  image: MediaRef;
  source?: { label: string; url: string };
  status: Status;
}

/** "Laykakota recupera 8 puntos" → "laykakota-recupera-8-puntos" */
export const slugify = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");

/** Minutos de lectura a unas 200 palabras por minuto. */
export const readingMinutes = (body: string) => Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 200));

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Lo que envía el editor del panel (se valida con articleSchema). */
export interface ArticleInput {
  title: string;
  slug: string;
  date: string;
  category: Category;
  excerpt: string;
  body: string;
  image: MediaRef;
  sourceLabel: string;
  sourceUrl: string;
  status: Status;
}

export const toInput = (a: Article): ArticleInput => ({
  title: a.title,
  slug: a.slug,
  date: a.date,
  category: a.category,
  excerpt: a.excerpt,
  body: a.body,
  image: a.image,
  sourceLabel: a.source?.label ?? "",
  sourceUrl: a.source?.url ?? "",
  status: a.status,
});
