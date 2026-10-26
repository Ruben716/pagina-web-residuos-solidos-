import type { Metadata } from "next";
import Image from "next/image";
import { getPageCopy, getPageMetadata } from "@/modules/copy";
import { ArticleList, FeaturedArticle, getArticles } from "@/modules/news";
import { getSiteMedia } from "@/modules/media";
import type { MediaKey } from "@/shared/content/media";
import { RevealGroup, RevealItem } from "@/shared/motion/reveal";
import { PageHero } from "@/shared/ui/page-hero";
import { Section, SectionHeading } from "@/shared/ui/section";

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("noticias");
}

/** fotos de la galería, en orden; los pies de foto se editan en el panel (Textos → Notas de prensa) */
const GALLERY: readonly MediaKey[] = ["fachada", "compostMercado", "recoleccionSelectiva", "equipoCampo"];

export default async function NoticiasPage() {
  const [t, media, [featured, ...rest]] = await Promise.all([getPageCopy("noticias"), getSiteMedia(), getArticles()]);
  const captions = t.galeria.captions.split("\n");
  return (
    <>
      <PageHero
        eyebrow={t.hero.eyebrow}
        title={t.hero.title}
        crumbs={[{ href: "/noticias", label: "Notas de prensa" }]}
        lede={t.hero.lede}
        image={media.cuadrillaLimpieza}
        focus="50% 40%"
      />

      <Section tone="soft" aria-labelledby="notas">
        <div className="shell">
          <SectionHeading id="notas" eyebrow={t.notas.eyebrow} title={t.notas.title} />
          {featured ? (
            <>
              <FeaturedArticle article={featured} />
              <div className="mt-6">
                <ArticleList articles={rest} />
              </div>
            </>
          ) : (
            <p className="rounded-2xl bg-white p-6 text-lg text-pizarra">{t.notas.empty}</p>
          )}
        </div>
      </Section>

      <Section tone="white" aria-labelledby="galeria">
        <div className="shell">
          <SectionHeading id="galeria" eyebrow={t.galeria.eyebrow} title={t.galeria.title} lede={t.galeria.lede} />
          <RevealGroup as="ul" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {GALLERY.map((image, i) => (
              <RevealItem as="li" key={image}>
                <figure className="group">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-bruma">
                    <Image
                      src={media[image].src}
                      alt={media[image].alt}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                    />
                  </div>
                  {captions[i] && <figcaption className="mt-3 text-sm font-semibold text-tinta">{captions[i]}</figcaption>}
                </figure>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Section>
    </>
  );
}
