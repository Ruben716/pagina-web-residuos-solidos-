import type { Metadata } from "next";
import Image from "next/image";
import { ArticleList, FeaturedArticle, getArticles } from "@/modules/news";
import { MEDIA } from "@/shared/content/media";
import { RevealGroup, RevealItem } from "@/shared/motion/reveal";
import { PageHero } from "@/shared/ui/page-hero";
import { Section, SectionHeading } from "@/shared/ui/section";

export const metadata: Metadata = {
  title: "Notas de prensa",
  description: "Intervenciones, campañas, infraestructura y orientación sobre la gestión de residuos sólidos en Puno.",
};

const GALLERY = [
  { media: MEDIA.fachada, caption: "Palacio Municipal, sede de la atención al vecino" },
  { media: MEDIA.compostMercado, caption: "Entrega de compost en el mercado Unión y Dignidad" },
  { media: MEDIA.recoleccionSelectiva, caption: "Recolección selectiva de aprovechables" },
  { media: MEDIA.equipoCampo, caption: "Intervención en La Rinconada Salcedo" },
] as const;

export default function NoticiasPage() {
  const [featured, ...rest] = getArticles();
  return (
    <>
      <PageHero
        eyebrow="Sala de prensa"
        title="Notas de prensa"
        crumbs={[{ href: "/noticias", label: "Notas de prensa" }]}
        lede="Lo que hace la Municipalidad con la basura de la ciudad: intervenciones, campañas, obras y resultados de la gestión."
        image={MEDIA.cuadrillaLimpieza}
        focus="50% 40%"
      />

      <Section tone="soft" aria-labelledby="notas">
        <div className="shell">
          <SectionHeading id="notas" eyebrow="Artículos recientes" title="Intervenciones, obras y orientación" />
          <FeaturedArticle article={featured} />
          <div className="mt-6">
            <ArticleList articles={rest} />
          </div>
        </div>
      </Section>

      <Section tone="white" aria-labelledby="galeria">
        <div className="shell">
          <SectionHeading
            id="galeria"
            eyebrow="Impacto real"
            title="La gestión en imágenes"
            lede="Fotografías de las actividades de la Gerencia de Gestión Integral de Residuos Sólidos."
          />
          <RevealGroup as="ul" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {GALLERY.map(({ media, caption }) => (
              <RevealItem as="li" key={media.src}>
                <figure className="group">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-bruma">
                    <Image
                      src={media.src}
                      alt={media.alt}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                    />
                  </div>
                  <figcaption className="mt-3 text-sm font-semibold text-tinta">{caption}</figcaption>
                </figure>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Section>
    </>
  );
}
