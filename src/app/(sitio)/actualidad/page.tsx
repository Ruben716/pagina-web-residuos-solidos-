import type { Metadata } from "next";
import { getPageCopy, getPageMetadata } from "@/modules/copy";
import { FeedEmpty, getFacebookFeed, PostFeed } from "@/modules/facebook";
import { ButtonLink } from "@/shared/ui/button";
import { PageHero } from "@/shared/ui/page-hero";
import { Section } from "@/shared/ui/section";
import { getSiteMedia } from "@/modules/media";

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("actualidad");
}

export default async function ActualidadPage() {
  const [t, media, feed] = await Promise.all([getPageCopy("actualidad"), getSiteMedia(), getFacebookFeed()]);

  return (
    <>
      <PageHero
        eyebrow={t.hero.eyebrow}
        title={t.hero.title}
        crumbs={[{ href: "/actualidad", label: "Actualidad" }]}
        lede={t.hero.lede}
        image={media.limpiezaBarrio}
        focus="50% 45%"
      >
        <ButtonLink href={feed.pageUrl} target="_blank" rel="noreferrer" variant="white" icon="external">
          {t.hero.button}
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
