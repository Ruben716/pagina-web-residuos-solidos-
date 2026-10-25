import { NextResponse, type NextRequest } from "next/server";
import { ARTICLES } from "@/modules/news/data";

const ROUTE_SLUG = /^ruta-(0[1-9]|1\d|2\d)$/;
const NEWS_SLUGS = new Set(ARTICLES.map((a) => a.slug));

/**
 * Con Partial Prerendering el shell sale antes de que la página llame a notFound(),
 * y el estado quedaría en 200. Aquí se rechazan los slugs inexistentes antes de renderizar,
 * para que buscadores y enlaces rotos reciban un 404 real.
 */
export function proxy(request: NextRequest) {
  const [, section, slug] = request.nextUrl.pathname.split("/");
  const known = section === "rutas" ? ROUTE_SLUG.test(slug) : NEWS_SLUGS.has(slug);
  if (known) return NextResponse.next();
  return NextResponse.rewrite(new URL("/__no-encontrado", request.url), { status: 404 });
}

export const config = {
  matcher: ["/rutas/:slug", "/noticias/:slug"],
};
