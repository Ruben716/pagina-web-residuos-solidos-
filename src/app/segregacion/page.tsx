import type { Metadata } from "next";
import { BinGrid, BINS, ITEMS, WhereDoesItGo } from "@/modules/segregation";
import { SOURCES } from "@/shared/content/facts";
import { MEDIA } from "@/shared/content/media";
import { ImageReveal } from "@/shared/motion/image-reveal";
import { Reveal, RevealGroup, RevealItem } from "@/shared/motion/reveal";
import { ButtonLink } from "@/shared/ui/button";
import { Icon, type IconName } from "@/shared/ui/icon";
import { PageHero } from "@/shared/ui/page-hero";
import { Section, SectionHeading } from "@/shared/ui/section";

export const metadata: Metadata = {
  title: "Segregación en la fuente",
  description:
    "Qué va en la bolsa verde, marrón, negra y roja según la NTP 900.058:2019, días de recojo y un buscador para saber dónde botar cada objeto.",
};

const PROGRAM: readonly { icon: IconName; title: string; text: string }[] = [
  {
    icon: "users",
    title: "Te visita un promotor ambiental",
    text: "Un promotor de la Municipalidad pasa por tu vivienda y te explica cómo separar los residuos aprovechables.",
  },
  {
    icon: "recycle",
    title: "Recibes tu bolsa verde",
    text: "Si tu hogar se suma al programa, recibes una bolsa verde para papel, cartón, botellas, latas y vidrio limpios y secos.",
  },
  {
    icon: "truck",
    title: "Recojo selectivo",
    text: "El vehículo de recolección selectiva pasa el día y la hora que te indica el promotor. Lo recuperado llega a recicladores formalizados.",
  },
];

const HABITS = [
  { title: "Vacía y enjuaga", text: "Los envases sucios contaminan el papel y el cartón de la misma bolsa." },
  { title: "Aplasta", text: "Botellas, latas y cajas aplastadas ocupan menos en tu casa y en el camión." },
  { title: "Escurre los orgánicos", text: "Menos líquido es menos olor, menos moscas y un mejor compost." },
  { title: "Saca la bolsa a tiempo", text: "Sólo cuando el camión está por pasar, nunca en la esquina antes de hora." },
];

export default function SegregacionPage() {
  return (
    <>
      <PageHero
        eyebrow="Segregación en la fuente"
        title="Separa tus residuos en cuatro colores"
        crumbs={[{ href: "/segregacion", label: "Segregación" }]}
        lede="El 84 % de lo que bota un hogar puneño se puede aprovechar. Para lograrlo, cada residuo tiene que salir de casa en la bolsa correcta."
        image={MEDIA.contenedoresPlaza}
        focus="50% 60%"
      >
        <ButtonLink href="#buscador" variant="white" icon="arrowDown">
          ¿Dónde va esto?
        </ButtonLink>
        <ButtonLink href="#colores" variant="ghost">
          Ver los 4 colores
        </ButtonLink>
      </PageHero>

      <Section tone="white" aria-labelledby="recojo">
        <div className="shell grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <ImageReveal
            media={MEDIA.contenedoresParque}
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="aspect-[4/3] rounded-3xl shadow-panel"
          />
          <Reveal>
            <p className="eyebrow">Recojo a domicilio</p>
            <h2 id="recojo" className="mt-3 text-[clamp(1.75rem,3.4vw,2.6rem)] leading-[1.12] font-extrabold text-puno-800">
              Separa lo que sí sirve
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-pizarra">
              Participa en la recolección selectiva domiciliaria de la ciudad de Puno. Entrega tus materiales clasificados y ayuda a que
              lleguen al reciclaje y al compostaje en lugar del relleno sanitario.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "No necesitas tachos nuevos: bastan bolsas o cajas marcadas.",
                "Los aprovechables limpios valen más para los recicladores.",
                "Los orgánicos separados se convierten en abono municipal.",
              ].map((t) => (
                <li key={t} className="flex gap-3 font-semibold text-tinta">
                  <Icon name="checkCircle" size={20} className="mt-0.5 shrink-0 text-exito" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="#colores" icon="arrowDown">
                Qué va en cada color
              </ButtonLink>
              <ButtonLink href="/rutas" variant="outline">
                Días de recojo de mi ruta
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section tone="soft" id="colores" aria-labelledby="colores-titulo">
        <div className="shell">
          <SectionHeading
            id="colores-titulo"
            eyebrow="Código de colores NTP 900.058:2019"
            title="Los cuatro colores de tu casa"
            lede="Es el código que usan todas las municipalidades del Perú en domicilios y espacios públicos."
            align="center"
          />
          <BinGrid bins={BINS} />
          <p className="mt-8 text-center text-sm text-pizarra">
            Fuente:{" "}
            <a href={SOURCES.ntp.url} target="_blank" rel="noreferrer" className="font-semibold text-puno underline underline-offset-4">
              {SOURCES.ntp.label}
            </a>
            , ámbito municipal.
          </p>
        </div>
      </Section>

      <Section tone="white" id="buscador" aria-labelledby="buscador-titulo">
        <div className="shell">
          <SectionHeading
            id="buscador-titulo"
            eyebrow="Buscador"
            title="¿Dónde va esto?"
            lede="Escribe un objeto o recorre el índice. Si algo no aparece y tienes dudas, va en la bolsa negra."
          />
          <WhereDoesItGo items={ITEMS} bins={BINS} />
        </div>
      </Section>

      <Section tone="brand" aria-labelledby="programa" className="overflow-hidden">
        <div aria-hidden className="lake-waves absolute inset-x-0 bottom-8 text-white/10" />
        <div className="shell relative">
          <SectionHeading
            id="programa"
            tone="light"
            eyebrow="Programa de segregación y recolección selectiva"
            title="Así funciona la bolsa verde"
            align="center"
          />
          <RevealGroup as="ol" className="grid gap-5 md:grid-cols-3">
            {PROGRAM.map((p, i) => (
              <RevealItem as="li" key={p.title} className="relative rounded-2xl bg-white/8 p-6 ring-1 ring-white/15">
                <span className="numeral absolute top-5 right-6 text-5xl text-white/15">{i + 1}</span>
                <span className="grid size-12 place-items-center rounded-xl bg-white text-puno-800">
                  <Icon name={p.icon} size={24} />
                </span>
                <h3 className="mt-5 text-lg font-extrabold">{p.title}</h3>
                <p className="mt-2 leading-relaxed text-white/80">{p.text}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Section>

      <Section tone="white" aria-labelledby="habitos">
        <div className="shell">
          <SectionHeading id="habitos" eyebrow="Buenas prácticas" title="Cuatro hábitos que hacen la diferencia" />
          <RevealGroup as="ol" className="grid gap-x-8 gap-y-8 border-t border-bruma pt-10 sm:grid-cols-2 lg:grid-cols-4">
            {HABITS.map((h, i) => (
              <RevealItem as="li" key={h.title}>
                <span className="numeral text-5xl text-puno-500">{i + 1}</span>
                <h3 className="mt-3 text-lg font-extrabold text-puno-800">{h.title}</h3>
                <p className="mt-1.5 leading-relaxed text-pizarra">{h.text}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Section>
    </>
  );
}
