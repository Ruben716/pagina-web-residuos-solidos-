import type { MetadataRoute } from "next";
import { getArticles } from "@/modules/news";
import { getRoutes } from "@/modules/routes";
import { NAV, SITE } from "@/shared/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, SITE.url).toString();
  return [
    { url: url("/"), priority: 1 },
    ...NAV.map((n) => ({ url: url(n.href), priority: 0.8 })),
    { url: url("/reporta"), priority: 0.8 },
    { url: url("/noticias"), priority: 0.7 },
    ...getRoutes().map((r) => ({ url: url(`/rutas/${r.slug}`), priority: 0.6 })),
    ...getArticles().map((a) => ({ url: url(`/noticias/${a.slug}`), lastModified: a.date, priority: 0.5 })),
  ];
}
