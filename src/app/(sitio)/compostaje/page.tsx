import type { Metadata } from "next";
import { getPageCopy, getPageMetadata } from "@/modules/copy";
import { EnrollmentForm, ImpactCalculator } from "@/modules/compost";
import { ImageReveal } from "@/shared/motion/image-reveal";
import { Reveal, RevealGroup, RevealItem } from "@/shared/motion/reveal";
import { Icon } from "@/shared/ui/icon";
import { PageHero } from "@/shared/ui/page-hero";
import { Section, SectionHeading } from "@/shared/ui/section";
import { ButtonLink } from "@/shared/ui/button";
import { getSiteMedia } from "@/modules/media";

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("compostaje");
}

const PLANT_NOTE =
  "https://portal.munipuno.gob.pe/es/promotores-ambientales-realizan-entrega-de-compost-organico-comerciantes-del-mercado-union-y";

export default async function CompostajePage() {
  const [t, media] = await Promise.all([getPageCopy("compostaje"), getSiteMedia()]);
  return (
    <>
      <PageHero
        eyebrow={t.hero.eyebrow}
        title={t.hero.title}
        crumbs={[{ href: "/compostaje", label: "Compostaje" }]}
        lede={t.hero.lede}
        image={media.compostajeMunicipal}
        focus="65% 50%"
      >
        <ButtonLink href="#inscripcion" variant="white" icon="arrowDown">
          {t.hero.button}
        </ButtonLink>
        <ButtonLink href="#calculadora" variant="ghost">
          {t.hero.secondary}
        </ButtonLink>
      </PageHero>

      <Section tone="white" aria-labelledby="planta">
        <div className="shell grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="eyebrow">{t.planta.eyebrow}</p>
            <h2 id="planta" className="mt-3 text-[clamp(1.75rem,3.4vw,2.6rem)] leading-[1.12] font-extrabold text-puno-800">
              {t.planta.title}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-pizarra">{t.planta.p1}</p>
            <p className="mt-4 leading-relaxed text-pizarra">{t.planta.p2}</p>
            <dl className="mt-8 grid grid-cols-2 gap-4">
              {t.planta.items.map((s, i) => (
                <div key={i} className="flex flex-col rounded-2xl bg-cielo p-5">
                  <dt className="text-sm text-pizarra">{s.text}</dt>
                  <dd className="numeral order-first text-4xl text-puno-800">{s.title}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-sm text-pizarra">
              Fuente:{" "}
              <a href={PLANT_NOTE} target="_blank" rel="noreferrer" className="font-semibold text-puno underline underline-offset-4">
                nota de prensa de la Municipalidad Provincial de Puno
              </a>{" "}
              y Estudio de Caracterización de Residuos Sólidos de Puno, 2015.
            </p>
          </Reveal>
          <ImageReveal
            media={media.compostMercado}
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="aspect-[4/3] rounded-3xl shadow-panel"
          />
        </div>
      </Section>

      <Section tone="soft" id="calculadora" aria-labelledby="calculadora-titulo">
        <div className="shell grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading
              id="calculadora-titulo"
              eyebrow={t.calculadora.eyebrow}
              title={t.calculadora.title}
              lede={t.calculadora.lede}
              className="mb-0 md:mb-0"
            />
          </div>
          <Reveal className="rounded-3xl bg-white p-6 shadow-panel ring-1 ring-bruma md:p-8 lg:col-span-8">
            <ImpactCalculator />
          </Reveal>
        </div>
      </Section>

      <Section tone="white" aria-labelledby="como-funciona">
        <div className="shell">
          <SectionHeading id="como-funciona" eyebrow={t.pasos.eyebrow} title={t.pasos.title} align="center" />
          <RevealGroup as="ol" className="relative grid gap-8 md:grid-cols-4 md:gap-6">
            <span aria-hidden className="absolute top-7 right-[12%] left-[12%] hidden h-0.5 bg-bruma md:block" />
            {t.pasos.items.map((s, i) => (
              <RevealItem as="li" key={i} className="relative text-center">
                <span className="relative mx-auto grid size-14 place-items-center rounded-full bg-puno text-xl font-extrabold text-white ring-8 ring-white">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-lg font-extrabold text-puno-800">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-[30ch] leading-relaxed text-pizarra">{s.text}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Section>

      <Section tone="soft" id="inscripcion" aria-labelledby="form-title">
        <div className="shell grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">{t.inscripcion.eyebrow}</p>
            <h2 id="form-title" className="mt-3 text-[clamp(1.75rem,3.4vw,2.6rem)] leading-[1.12] font-extrabold text-puno-800">
              {t.inscripcion.title}
            </h2>
            <p className="mt-5 font-bold text-tinta">{t.inscripcion.includedTitle}</p>
            <ul className="mt-3 space-y-3">
              {t.inscripcion.included.split("\n").map((item) => (
                <li key={item} className="flex gap-3 text-tinta">
                  <Icon name="checkCircle" size={20} className="mt-0.5 shrink-0 text-exito" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 rounded-xl bg-white p-4 text-sm text-pizarra ring-1 ring-bruma">{t.inscripcion.requirement}</p>
          </div>
          <Reveal className="rounded-3xl bg-white p-6 shadow-panel ring-1 ring-bruma md:p-8 lg:col-span-8">
            <EnrollmentForm />
          </Reveal>
        </div>
      </Section>
    </>
  );
}
