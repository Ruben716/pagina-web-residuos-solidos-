import type { Metadata } from "next";
import { EnrollmentForm, ImpactCalculator } from "@/modules/compost";
import { MEDIA } from "@/shared/content/media";
import { ImageReveal } from "@/shared/motion/image-reveal";
import { Reveal, RevealGroup, RevealItem } from "@/shared/motion/reveal";
import { Icon } from "@/shared/ui/icon";
import { PageHero } from "@/shared/ui/page-hero";
import { Section, SectionHeading } from "@/shared/ui/section";
import { ButtonLink } from "@/shared/ui/button";

export const metadata: Metadata = {
  title: "Programa Municipal de Compostaje",
  description:
    "Convierte los residuos orgánicos de tu casa en abono. Inscripción gratuita, compostera, capacitación y acompañamiento técnico de la Municipalidad Provincial de Puno.",
};

const STEPS = [
  { title: "Te inscribes", text: "Llenas el formulario de esta página. Un promotor ambiental te llama en los días siguientes." },
  { title: "Recibes el kit", text: "Compostera doméstica o tacho aireado, manual digital y una charla de inicio para tu familia." },
  {
    title: "Alimentas la compostera",
    text: "Capas de restos de cocina y material seco, como hojas o aserrín. Remueves una vez por semana.",
  },
  { title: "Cosechas abono", text: "En tres o cuatro meses tienes compost maduro para tus macetas, tu huerto o los parques del barrio." },
];

const INCLUDED = [
  "Compostera doméstica municipal o tacho aireado",
  "Manual digital y talleres de capacitación",
  "Asesoría técnica para huertos urbanos",
  "Registro en la red de hogares sostenibles de Puno",
  "Seguimiento técnico hasta la primera cosecha",
];

const PLANT_NOTE =
  "https://portal.munipuno.gob.pe/es/promotores-ambientales-realizan-entrega-de-compost-organico-comerciantes-del-mercado-union-y";

export default function CompostajePage() {
  return (
    <>
      <PageHero
        eyebrow="Economía circular"
        title="Programa Municipal de Compostaje"
        crumbs={[{ href: "/compostaje", label: "Compostaje" }]}
        lede="Dos de cada tres kilos de basura de un hogar puneño son restos orgánicos. En una compostera dejan de ser basura y vuelven a la tierra como abono."
        image={MEDIA.compostajeMunicipal}
        focus="65% 50%"
      >
        <ButtonLink href="#inscripcion" variant="white" icon="arrowDown">
          Inscribirme gratis
        </ButtonLink>
        <ButtonLink href="#calculadora" variant="ghost">
          Calcular mi impacto
        </ButtonLink>
      </PageHero>

      <Section tone="white" aria-labelledby="planta">
        <div className="shell grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="eyebrow">Planta municipal de compostaje</p>
            <h2 id="planta" className="mt-3 text-[clamp(1.75rem,3.4vw,2.6rem)] leading-[1.12] font-extrabold text-puno-800">
              Lo orgánico de los mercados vuelve como abono
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-pizarra">
              Cada día se recoge más de una tonelada de residuos orgánicos de los mercados de la ciudad. La Sub Gerencia de Valorización y
              Disposición Final los lleva a la planta de compostaje de la Municipalidad, donde se transforman en abono con el método
              Takakura.
            </p>
            <p className="mt-4 leading-relaxed text-pizarra">
              Ese compost vuelve a los comerciantes que separan sus residuos, como los del centro de abastos Unión y Dignidad, y a las áreas
              verdes de Puno. Menos residuos llegan al relleno sanitario.
            </p>
            <dl className="mt-8 grid grid-cols-2 gap-4">
              {[
                { value: "+1 t", label: "de orgánicos al día desde los mercados" },
                { value: "67 %", label: "de la basura domiciliaria es orgánica" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col rounded-2xl bg-cielo p-5">
                  <dt className="text-sm text-pizarra">{s.label}</dt>
                  <dd className="numeral order-first text-4xl text-puno-800">{s.value}</dd>
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
            media={MEDIA.compostMercado}
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
              eyebrow="Calculadora de impacto"
              title="¿Cuánto abono puede producir tu familia?"
              lede="Mueve el control según cuántas personas viven en tu casa."
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
          <SectionHeading id="como-funciona" eyebrow="Paso a paso" title="Cómo funciona el programa" align="center" />
          <RevealGroup as="ol" className="relative grid gap-8 md:grid-cols-4 md:gap-6">
            <span aria-hidden className="absolute top-7 right-[12%] left-[12%] hidden h-0.5 bg-bruma md:block" />
            {STEPS.map((s, i) => (
              <RevealItem as="li" key={s.title} className="relative text-center">
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
            <p className="eyebrow">Formulario de inscripción</p>
            <h2 id="form-title" className="mt-3 text-[clamp(1.75rem,3.4vw,2.6rem)] leading-[1.12] font-extrabold text-puno-800">
              Inscríbete gratis
            </h2>
            <p className="mt-5 font-bold text-tinta">Qué incluye:</p>
            <ul className="mt-3 space-y-3">
              {INCLUDED.map((item) => (
                <li key={item} className="flex gap-3 text-tinta">
                  <Icon name="checkCircle" size={20} className="mt-0.5 shrink-0 text-exito" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 rounded-xl bg-white p-4 text-sm text-pizarra ring-1 ring-bruma">
              Único requisito: el compromiso de separar los orgánicos de tu casa y asistir a la charla municipal.
            </p>
          </div>
          <Reveal className="rounded-3xl bg-white p-6 shadow-panel ring-1 ring-bruma md:p-8 lg:col-span-8">
            <EnrollmentForm />
          </Reveal>
        </div>
      </Section>
    </>
  );
}
