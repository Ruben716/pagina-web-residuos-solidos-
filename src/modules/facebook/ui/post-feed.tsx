"use client";

import { useLenis } from "lenis/react";
import { useRef, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { formatDate, formatNumber } from "@/shared/lib/format";
import { Reveal, RevealGroup, RevealItem } from "@/shared/motion/reveal";
import { Button } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import type { FacebookFeed, FacebookPost } from "../types";
import { FbImage } from "./fb-image";
import { KindTag } from "./kind-tag";
import { PhotoCarousel } from "./photo-carousel";
import { labelOf, titleOf } from "./post-text";
import { PostViewer } from "./post-viewer";
import { ShareLinks } from "./share-links";

/** Publicaciones por página. Todas ya están cargadas: la paginación es solo para leer cómodo. */
const PAGE_SIZE = 10;

const LINK = "inline-flex items-center gap-1.5 font-bold text-puno transition-colors hover:text-puno-800 hover:underline";

/**
 * Publicaciones de Facebook en tres bandas a todo el ancho (como Mongabay): la más reciente sobre verde
 * oscuro, la lista sobre blanco con etiquetas de color (como el PNUMA) y al final una franja limón para
 * seguir la página.
 */
export function PostFeed({ feed }: { feed: FacebookFeed }) {
  const { posts } = feed;
  const [page, setPage] = useState(0);
  const [view, setView] = useState<{ index: number; photo: number } | null>(null);
  const top = useRef<HTMLElement>(null);
  const lenis = useLenis();

  const [featured, ...list] = posts;
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const visible = list.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const open = (post: FacebookPost, photo = 0) => setView({ index: posts.indexOf(post), photo });
  const goTo = (next: number) => {
    setPage(next);
    const el = top.current;
    if (!el) return;
    // posición calculada aquí y no por Lenis: con un elemento como destino a veces terminaba en el tope de la página
    const y = el.getBoundingClientRect().top + window.scrollY - 60;
    if (lenis) lenis.scrollTo(y);
    else window.scrollTo({ top: y });
  };

  return (
    <>
      <Featured post={featured} onOpen={(photo) => open(featured, photo)} />

      {list.length > 0 && (
        <section ref={top} aria-labelledby="ultimas" className="bg-cielo py-14 md:py-20">
          <div className="shell max-w-5xl">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="ultimas" className="text-2xl font-extrabold text-puno-800 md:text-3xl">
                Últimas <span className="rounded-full bg-brote/70 px-3 py-0.5">publicaciones</span>
              </h2>
              <span className="text-sm font-semibold text-pizarra">{posts.length} en total</span>
            </div>

            <Timeline key={page} posts={visible} onOpen={open} />

            {pages > 1 && <Pagination page={page} pages={pages} onChange={goTo} />}
          </div>
        </section>
      )}

      <FollowStrip feed={feed} />

      {view && (
        <PostViewer
          posts={posts}
          index={view.index}
          photo={view.photo}
          onNavigate={(index) => setView({ index, photo: 0 })}
          onClose={() => setView(null)}
        />
      )}
    </>
  );
}

/** La más reciente, sobre una banda verde oscuro: fotos a la izquierda y texto en blanco a la derecha. */
function Featured({ post, onOpen }: { post: FacebookPost; onOpen: (photo: number) => void }) {
  const hasPhotos = post.photos.length > 0;
  return (
    <section aria-label="Publicación más reciente" className="bg-noche py-14 text-white md:py-20">
      <Reveal className="shell">
        <article
          id={`publicacion-${post.id}`}
          aria-label={labelOf(post)}
          className={cn("grid scroll-mt-28 items-center gap-8 lg:gap-14", hasPhotos && "lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]")}
        >
          {hasPhotos && (
            <PhotoCarousel
              post={post}
              sizes="(min-width: 1024px) 42rem, 100vw"
              onExpand={onOpen}
              contain
              label={<KindTag post={post} />}
              className="aspect-4/3 bg-puno-800"
            />
          )}
          <div className={cn(!hasPhotos && "max-w-3xl")}>
            <p className="text-xs font-extrabold tracking-[0.16em] text-brote uppercase">Lo más reciente</p>
            <p className="mt-3 flex flex-wrap items-center gap-3 text-sm font-semibold text-white/80">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              {!hasPhotos && <KindTag post={post} />}
            </p>
            <h3 className="mt-3 text-2xl leading-snug font-extrabold md:text-[1.75rem]">{titleOf(post)}</h3>
            {post.headline && post.body && (
              <p className="mt-4 line-clamp-4 leading-relaxed whitespace-pre-line text-white/80">{post.body}</p>
            )}
            <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Button variant="white" icon="arrow" onClick={() => onOpen(0)}>
                Leer completa
              </Button>
              <ShareLinks url={post.link} title={titleOf(post)} tone="dark" />
            </div>
          </div>
        </article>
      </Reveal>
    </section>
  );
}

/** Columnas de la línea de tiempo: fecha (solo en pantallas medianas), riel con el punto y contenido. */
const TIMELINE_GRID = "grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-4 md:grid-cols-[4.5rem_1.5rem_minmax(0,1fr)] md:gap-x-6";
/** El riel: una línea vertical continua; cada fila dibuja su tramo para que no se corte. */
const RAIL = "relative before:absolute before:inset-y-0 before:left-1/2 before:w-0.5 before:-translate-x-1/2 before:bg-puno/20";

const monthKey = (p: FacebookPost) => p.date.slice(0, 7);

/** Las publicaciones de la página en línea de tiempo, agrupadas por mes. */
function Timeline({ posts, onOpen }: { posts: readonly FacebookPost[]; onOpen: (post: FacebookPost, photo?: number) => void }) {
  const groups: { key: string; items: FacebookPost[] }[] = [];
  for (const p of posts) {
    const last = groups.at(-1);
    if (last?.key === monthKey(p)) last.items.push(p);
    else groups.push({ key: monthKey(p), items: [p] });
  }

  return (
    <RevealGroup as="ol" className="mt-8">
      {groups.map((g) => {
        const month = formatDate(`${g.key}-15`, { month: "long", year: "numeric" });
        return (
          <li key={g.key}>
            <h3 className={cn(TIMELINE_GRID, "items-center")}>
              <span aria-hidden className="hidden md:block" />
              <span aria-hidden className={cn(RAIL, "flex h-full min-h-12 items-center justify-center")}>
                <span className="relative grid size-6 place-items-center rounded-full bg-puno-800 text-brote ring-4 ring-cielo">
                  <Icon name="calendar" size={12} />
                </span>
              </span>
              <span className="flex items-center gap-3 py-3">
                <span className="rounded-full bg-puno-800 px-4 py-1.5 text-sm font-extrabold text-white">
                  {month.charAt(0).toUpperCase() + month.slice(1)}
                </span>
                <span className="text-sm font-semibold text-pizarra">
                  {g.items.length} {g.items.length === 1 ? "publicación" : "publicaciones"}
                </span>
              </span>
            </h3>
            <ul>
              {g.items.map((p) => (
                <RevealItem as="li" key={p.id}>
                  <TimelineItem post={p} onOpen={(photo) => onOpen(p, photo)} />
                </RevealItem>
              ))}
            </ul>
          </li>
        );
      })}
    </RevealGroup>
  );
}

/** Una publicación en la línea de tiempo: día a la izquierda, punto limón en el riel, fotos y texto. */
function TimelineItem({ post, onOpen }: { post: FacebookPost; onOpen: (photo: number) => void }) {
  const hasPhotos = post.photos.length > 0;
  return (
    <article id={`publicacion-${post.id}`} aria-label={labelOf(post)} className={cn(TIMELINE_GRID, "scroll-mt-28")}>
      <time dateTime={post.date} className="hidden pt-5 text-right md:block">
        <span className="numeral block text-4xl leading-none text-puno-800">{formatDate(post.date, { day: "2-digit" })}</span>
        <span className="mt-1 block text-xs font-bold tracking-[0.1em] text-pizarra uppercase">
          {formatDate(post.date, { weekday: "short" })}
        </span>
      </time>
      <span aria-hidden className={RAIL}>
        <span className="relative mx-auto mt-6 block size-4 rounded-full bg-brote ring-4 ring-cielo" />
      </span>
      <div
        className={cn(
          "grid gap-5 pt-5 pb-10 sm:gap-7",
          hasPhotos && "sm:grid-cols-[14rem_minmax(0,1fr)] md:grid-cols-[16rem_minmax(0,1fr)]",
        )}
      >
        {hasPhotos && (
          <PhotoCarousel
            post={post}
            compact
            sizes="(min-width: 640px) 16rem, 100vw"
            onExpand={onOpen}
            label={<KindTag post={post} />}
            className="aspect-4/3"
          />
        )}
        <div className="flex min-w-0 flex-col">
          <p className="flex flex-wrap items-center gap-3 text-sm">
            <time dateTime={post.date} className="font-semibold text-puno md:hidden">
              {formatDate(post.date)}
            </time>
            {!hasPhotos && <KindTag post={post} />}
          </p>
          <PostTitle post={post} onOpen={onOpen} />
        </div>
      </div>
    </article>
  );
}

function PostTitle({ post, onOpen }: { post: FacebookPost; onOpen: (photo: number) => void }) {
  return (
    <>
      <h4 className="mt-1.5 text-lg leading-snug font-extrabold text-puno-800">
        <button
          type="button"
          onClick={() => onOpen(0)}
          className="line-clamp-3 text-left transition-colors hover:text-puno hover:underline"
        >
          {titleOf(post)}
        </button>
      </h4>
      {post.headline && post.body && <p className="mt-2 line-clamp-2 leading-relaxed text-pizarra">{post.body}</p>}
      <button type="button" onClick={() => onOpen(0)} className={cn(LINK, "mt-3 self-start text-sm")}>
        Leer más<span className="sr-only">: {labelOf(post)}</span>
        <Icon name="arrow" size={15} />
      </button>
    </>
  );
}

/** Franja limón a todo el ancho para seguir la página de Facebook. */
function FollowStrip({ feed }: { feed: FacebookFeed }) {
  const { page } = feed;
  return (
    <section aria-labelledby="seguir-facebook" className="bg-brote py-10 text-noche md:py-12">
      <div className="shell flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-noche text-white">
            <Icon name="facebook" size={24} />
            {page?.picture && <FbImage src={page.picture} alt="" fill sizes="56px" className="object-cover" />}
          </span>
          <div>
            <h2 id="seguir-facebook" className="text-xl font-extrabold md:text-2xl">
              Síguenos en Facebook{page?.name ? `: ${page.name}` : ""}
            </h2>
            <p className="mt-0.5 text-noche/80">
              {page?.followers != null && (
                <strong className="font-extrabold text-noche">{formatNumber(page.followers)} seguidores. </strong>
              )}
              Lo que publicamos allá aparece aquí solo, en menos de una hora.
            </p>
          </div>
        </div>
        <a
          href={feed.pageUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-noche px-6 font-bold text-white transition-colors hover:bg-puno-800 md:self-auto"
        >
          <Icon name="facebook" size={18} />
          Seguir la página
          <span className="sr-only"> (se abre en otra pestaña)</span>
        </a>
      </div>
    </section>
  );
}

/** Numeración de páginas; en celular, solo anterior/siguiente y "2 de 5". */
function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (page: number) => void }) {
  const step = "inline-flex min-h-11 items-center gap-1.5 font-bold text-puno transition-colors hover:text-puno-800 disabled:invisible";
  return (
    <nav aria-label="Páginas de publicaciones" className="mt-4 flex items-center justify-between gap-4 border-t border-bruma pt-5">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page === 0} className={step}>
        <Icon name="chevronLeft" size={18} />
        Anterior
      </button>
      <ol className="hidden items-center gap-1 sm:flex">
        {Array.from({ length: pages }, (_, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => onChange(i)}
              aria-current={i === page ? "page" : undefined}
              className={cn(
                "grid size-10 place-items-center rounded-full text-sm font-bold tabular-nums transition-colors",
                i === page ? "bg-puno text-white" : "text-puno-800 hover:bg-cielo",
              )}
            >
              <span className="sr-only">Página </span>
              {i + 1}
            </button>
          </li>
        ))}
      </ol>
      <p className="text-sm font-semibold text-pizarra sm:hidden">
        Página {page + 1} de {pages}
      </p>
      <button type="button" onClick={() => onChange(page + 1)} disabled={page === pages - 1} className={step}>
        Siguiente
        <Icon name="chevronRight" size={18} />
      </button>
    </nav>
  );
}
