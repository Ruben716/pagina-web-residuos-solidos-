import type { Metadata } from "next";
import { Suspense } from "react";
import { getPageCopy, getPageMetadata } from "@/modules/copy";
import { ReportWizard } from "@/modules/reports";
import { Reveal, RevealGroup, RevealItem } from "@/shared/motion/reveal";
import { ButtonLink } from "@/shared/ui/button";
import { Icon, type IconName } from "@/shared/ui/icon";
import { PageHero } from "@/shared/ui/page-hero";
import { Section, SectionHeading } from "@/shared/ui/section";
import { getSiteMedia } from "@/modules/media";

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("reporta");
}

/** íconos de los tres pasos, en orden (los textos se editan en el panel) */
const STEP_ICONS: readonly IconName[] = ["camera", "gps", "ticket"];

export default async function ReportaPage() {
  const [t, media] = await Promise.all([getPageCopy("reporta"), getSiteMedia()]);
  return (
    <>
      <PageHero
        eyebrow={t.hero.eyebrow}
        title={t.hero.title}
        crumbs={[{ href: "/reporta", label: "Reporta a tu vecino" }]}
        lede={t.hero.lede}
        image={media.puntoCritico}
        focus="50% 70%"
      >
        <ButtonLink href="/reporta/seguimiento" variant="white" icon="arrow">
          {t.hero.button}
        </ButtonLink>
      </PageHero>

      <section className="relative z-10 -mt-8 md:-mt-10">
        <div className="shell">
          <RevealGroup as="ul" className="grid gap-px overflow-hidden rounded-2xl bg-bruma shadow-float ring-1 ring-bruma md:grid-cols-3">
            {t.pasos.items.map((f, i) => (
              <RevealItem as="li" key={i} className="flex gap-4 bg-white p-5 md:p-6">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-celeste-50 text-puno">
                  <Icon name={STEP_ICONS[i]} size={24} />
                </span>
                <span>
                  <span className="text-xs font-extrabold tracking-[0.12em] text-puno uppercase">Paso {i + 1}</span>
                  <span className="block font-extrabold text-puno-800">{f.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-pizarra">{f.text}</span>
                </span>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <Section tone="white" aria-labelledby="formulario">
        <div className="shell grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading
              id="formulario"
              eyebrow={t.formulario.eyebrow}
              title={t.formulario.title}
              lede={t.formulario.lede}
              className="mb-6 md:mb-6"
            />
            <Reveal className="rounded-2xl bg-puno-800 p-6 text-white">
              <p className="flex items-center gap-2 text-sm font-extrabold tracking-[0.1em] text-celeste-200 uppercase">
                <Icon name="scale" size={18} />
                {t.norma.title}
              </p>
              <p className="mt-3 leading-relaxed text-white/90">{t.norma.text}</p>
              <p className="mt-3 text-sm leading-relaxed text-white/70">{t.norma.note}</p>
            </Reveal>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-panel ring-1 ring-bruma md:p-8 lg:col-span-8">
            <Suspense fallback={<div className="h-[36rem]" />}>
              <ReportWizard />
            </Suspense>
          </div>
        </div>
      </Section>
    </>
  );
}
