import type { Metadata } from "next";
import { Suspense } from "react";
import { getPageCopy, getPageMetadata } from "@/modules/copy";
import { getRoutes, getSectors, plannerView, RoutePlannerFromUrl, RoutesTable } from "@/modules/routes";
import { RevealGroup, RevealItem } from "@/shared/motion/reveal";
import { Icon, type IconName } from "@/shared/ui/icon";
import { PageHero } from "@/shared/ui/page-hero";
import { Section, SectionHeading } from "@/shared/ui/section";
import { getSiteMedia } from "@/modules/media";

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("rutas");
}

/** íconos de las recomendaciones, en orden (los textos se editan en el panel) */
const TIP_ICONS: readonly IconName[] = ["clock", "trash", "alert"];

export default async function RutasPage() {
  const [t, media] = await Promise.all([getPageCopy("rutas"), getSiteMedia()]);
  const routes = plannerView();
  const sectors = getSectors();

  return (
    <>
      <PageHero
        eyebrow={t.hero.eyebrow}
        title={t.hero.title}
        crumbs={[{ href: "/rutas", label: "Rutas y horarios" }]}
        lede={t.hero.lede}
        image={media.recoleccionSelectiva}
        focus="60% 40%"
      />

      <section aria-labelledby="mapa-titulo" className="bg-cielo">
        <h2 id="mapa-titulo" className="sr-only">
          Mapa de rutas
        </h2>
        <Suspense fallback={<div className="h-[min(48rem,calc(100svh-6rem))] min-h-[38rem] animate-pulse bg-bruma" />}>
          <RoutePlannerFromUrl routes={routes} sectors={sectors} />
        </Suspense>
      </section>

      <Section tone="soft" id="horarios" aria-labelledby="horarios-titulo">
        <div className="shell">
          <SectionHeading id="horarios-titulo" eyebrow={t.horarios.eyebrow} title={t.horarios.title} lede={t.horarios.lede} />
          <RoutesTable sectors={sectors} routes={getRoutes()} />
        </div>
      </Section>

      <Section tone="white" aria-labelledby="consejos-titulo">
        <div className="shell">
          <SectionHeading id="consejos-titulo" eyebrow={t.consejos.eyebrow} title={t.consejos.title} align="center" />
          <RevealGroup as="ul" className="grid gap-6 md:grid-cols-3">
            {t.consejos.items.map((tip, i) => (
              <RevealItem as="li" key={i} className="rounded-2xl border border-bruma p-6">
                <span className="grid size-12 place-items-center rounded-xl bg-celeste-50 text-puno">
                  <Icon name={TIP_ICONS[i]} size={24} />
                </span>
                <h3 className="mt-4 text-lg font-extrabold text-puno-800">{tip.title}</h3>
                <p className="mt-2 leading-relaxed text-pizarra">{tip.text}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Section>
    </>
  );
}
