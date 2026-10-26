import type { Metadata } from "next";
import { FeedEmpty, getFacebookFeed, PostFeed } from "@/modules/facebook";
import { MEDIA } from "@/shared/content/media";
import { ButtonLink } from "@/shared/ui/button";
import { PageHero } from "@/shared/ui/page-hero";
import { Section } from "@/shared/ui/section";

export const metadata: Metadata = {
  title: "Actualidad",
  description:
    "Noticias y comunicados de la Gerencia de Gestión Integral de Residuos Sólidos: operativos, campañas, avisos y resultados, al día con Facebook.",
};

export default async function ActualidadPage() {
  const feed = await getFacebookFeed();

  return (
    <>
      <PageHero
        eyebrow="Noticias y comunicados"
        title="Actualidad"
        crumbs={[{ href: "/actualidad", label: "Actualidad" }]}
        lede="Operativos de limpieza, campañas, avisos de horario y resultados de la gestión, al día con nuestra página de Facebook."
        image={MEDIA.limpiezaBarrio}
        focus="50% 45%"
      >
        <ButtonLink href={feed.pageUrl} target="_blank" rel="noreferrer" variant="white" icon="external">
          Seguir en Facebook
          <span className="sr-only"> (se abre en otra pestaña)</span>
        </ButtonLink>
      </PageHero>

      {feed.posts.length ? (
        <PostFeed feed={feed} />
      ) : (
        <Section tone="white" aria-label="Publicaciones" className="py-12 md:py-16">
          <div className="shell">
            <FeedEmpty feed={feed} />
          </div>
        </Section>
      )}
    </>
  );
}
