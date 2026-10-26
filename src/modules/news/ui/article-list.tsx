import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { getSiteMedia, mediaFor } from "@/modules/media";
import { formatDate } from "@/shared/lib/format";
import { RevealGroup, RevealItem } from "@/shared/motion/reveal";
import { Icon } from "@/shared/ui/icon";
import { type Article, readingMinutes } from "../domain/article";

/** Nota destacada: foto grande y texto al lado. */
export async function FeaturedArticle({ article }: { article: Article }) {
  const media = mediaFor(await getSiteMedia(), article.image);
  return (
    <Link
      href={`/noticias/${article.slug}`}
      className="group grid overflow-hidden rounded-3xl bg-white shadow-panel ring-1 ring-bruma lg:grid-cols-2"
    >
      <ViewTransition name={`news-${article.slug}`} share="morph" default="none">
        <div className="relative aspect-[16/10] overflow-hidden bg-bruma lg:aspect-auto lg:min-h-[24rem]">
          <Image
            src={media.src}
            alt=""
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
          />
          <span className="absolute top-4 left-4 rounded-full bg-white px-3 py-1 text-xs font-extrabold text-puno-800 shadow-sm">
            {article.category}
          </span>
        </div>
      </ViewTransition>
      <div className="flex flex-col justify-center p-6 md:p-10">
        <p className="flex items-center gap-2 text-sm font-semibold text-pizarra">
          <Icon name="calendar" size={15} />
          <time dateTime={article.date}>{formatDate(article.date)}</time>
          <span aria-hidden>·</span>
          {readingMinutes(article.body)} min de lectura
        </p>
        <h3 className="mt-3 text-2xl leading-tight font-extrabold text-puno-800 transition-colors group-hover:text-puno md:text-3xl">
          {article.title}
        </h3>
        <p className="mt-3 text-lg leading-relaxed text-pizarra">{article.excerpt}</p>
        <span className="mt-6 inline-flex items-center gap-2 font-bold text-puno">
          Leer nota completa
          <Icon name="arrow" size={18} className="transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

/** Notas de prensa en cuadrícula: foto, fecha, categoría, titular y bajada. */
export async function ArticleList({ articles }: { articles: readonly Article[] }) {
  const photos = await getSiteMedia();
  return (
    <RevealGroup as="ul" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((a) => {
        const media = mediaFor(photos, a.image);
        return (
          <RevealItem as="li" key={a.slug}>
            <Link
              href={`/noticias/${a.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-bruma transition-shadow duration-500 hover:shadow-panel"
            >
              <ViewTransition name={`news-${a.slug}`} share="morph" default="none">
                <div className="relative aspect-[16/10] overflow-hidden bg-bruma">
                  <Image
                    src={media.src}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 rounded-full bg-white px-2.5 py-0.5 text-xs font-extrabold text-puno-800 shadow-sm">
                    {a.category}
                  </span>
                </div>
              </ViewTransition>
              <div className="flex flex-1 flex-col p-5">
                <p className="flex items-center gap-2 text-xs font-semibold text-pizarra">
                  <Icon name="calendar" size={14} />
                  <time dateTime={a.date}>{formatDate(a.date, { dateStyle: "medium" })}</time>
                  <span aria-hidden>·</span>
                  {readingMinutes(a.body)} min
                </p>
                <h3 className="mt-2 text-lg leading-snug font-extrabold text-puno-800 transition-colors group-hover:text-puno">
                  {a.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-pizarra">{a.excerpt}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-bold text-puno">
                  Leer más
                  <Icon name="arrow" size={16} className="transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </RevealItem>
        );
      })}
    </RevealGroup>
  );
}
