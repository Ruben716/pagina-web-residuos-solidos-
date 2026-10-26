import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, ViewTransition } from "react";
import { getSiteMedia, mediaFor } from "@/modules/media";
import { getPageCopy } from "@/modules/copy";
import { ArticleList, getArticle, getArticles, Markdown, readingMinutes } from "@/modules/news";
import { formatDate } from "@/shared/lib/format";
import { FadeIn } from "@/shared/motion/fade-in";
import { LineReveal } from "@/shared/motion/line-reveal";
import { Icon } from "@/shared/ui/icon";
import { Section, SectionHeading } from "@/shared/ui/section";

export async function generateStaticParams() {
  const slugs = (await getArticles()).map((a) => ({ slug: a.slug }));
  // hace falta al menos una para prerenderizar el armazón; el proxy responde 404 a las que no existen
  return slugs.length ? slugs : [{ slug: "sin-notas" }];
}

export async function generateMetadata({ params }: PageProps<"/noticias/[slug]">): Promise<Metadata> {
  const article = await getArticle((await params).slug);
  if (!article) return {};
  const media = await getSiteMedia();
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: { type: "article", publishedTime: article.date, images: [mediaFor(media, article.image).src] },
  };
}

// El shell de la ruta no depende del slug; el detalle llega dentro de Suspense (Partial Prefetching).
export default function NoticiaPage({ params }: PageProps<"/noticias/[slug]">) {
  return (
    <Suspense fallback={<DetailFallback />}>
      <NoticiaDetail params={params} />
    </Suspense>
  );
}

function DetailFallback() {
  return <div aria-busy className="min-h-[85svh] bg-cielo" />;
}

async function NoticiaDetail({ params }: Pick<PageProps<"/noticias/[slug]">, "params">) {
  const article = await getArticle((await params).slug);
  if (!article) notFound();
  const [t, siteMedia, articles] = await Promise.all([getPageCopy("noticias"), getSiteMedia(), getArticles()]);
  const media = mediaFor(siteMedia, article.image);
  const related = articles.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <article>
      <header className="bg-cielo">
        <div className="shell max-w-5xl pt-8 pb-10 md:pt-12">
          <nav aria-label="Ruta de navegación" className="text-sm text-pizarra">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="inline-flex items-center gap-1.5 hover:text-puno hover:underline">
                  <Icon name="home" size={15} />
                  Inicio
                </Link>
              </li>
              <li className="flex items-center gap-1.5">
                <Icon name="chevronRight" size={14} className="opacity-60" />
                <Link href="/noticias" className="hover:text-puno hover:underline">
                  Notas de prensa
                </Link>
              </li>
            </ol>
          </nav>
          <p className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-pizarra">
            <span className="rounded-full bg-puno px-3 py-1 text-xs font-extrabold text-white">{article.category}</span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="calendar" size={15} />
              <time dateTime={article.date}>{formatDate(article.date)}</time>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="clock" size={15} />
              {readingMinutes(article.body)} min de lectura
            </span>
          </p>
          <LineReveal
            as="h1"
            trigger="mount"
            text={article.title}
            className="mt-5 text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.08] font-extrabold tracking-[-0.02em] text-puno-800"
          />
          <FadeIn delay={0.2}>
            <p className="mt-5 max-w-[62ch] text-xl leading-relaxed text-pizarra">{article.excerpt}</p>
          </FadeIn>
        </div>
      </header>

      <div className="bg-[linear-gradient(var(--color-cielo)_50%,white_50%)]">
        <div className="shell max-w-5xl">
          <ViewTransition name={`news-${article.slug}`} share="morph" default="none">
            <figure>
              <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-bruma shadow-panel">
                <Image
                  src={media.src}
                  alt={media.alt}
                  fill
                  loading="eager"
                  fetchPriority="high"
                  sizes="(min-width: 1024px) 64rem, 100vw"
                  className="object-cover"
                />
              </div>
              {media.credit && (
                <figcaption className="mt-2 text-xs text-pizarra">
                  Foto: {media.credit.author}, {media.credit.source} ({media.credit.license}).
                </figcaption>
              )}
            </figure>
          </ViewTransition>
        </div>
      </div>

      <section className="bg-white py-12 md:py-16">
        <div className="shell max-w-3xl space-y-6">
          <Markdown source={article.body} />
          {article.source && (
            <p className="flex items-center gap-2 border-t border-bruma pt-6 text-base text-pizarra">
              <Icon name="external" size={16} className="text-puno" />
              Fuente:{" "}
              <a
                href={article.source.url}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-puno underline underline-offset-4"
              >
                {article.source.label}
                <span className="sr-only"> (se abre en otra pestaña)</span>
              </a>
            </p>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <Section tone="soft" aria-labelledby="mas">
          <div className="shell">
            <SectionHeading id="mas" eyebrow={t.relacionadas.eyebrow} title={t.relacionadas.title} />
            <ArticleList articles={related} />
          </div>
        </Section>
      )}
    </article>
  );
}
