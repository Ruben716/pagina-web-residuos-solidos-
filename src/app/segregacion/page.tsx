import type { Metadata } from "next";
import Link from "next/link";
import { BinBands, BINS, ITEMS, SegregationHero, type Share, SortingGame, WasteComposition, WhereDoesItGo } from "@/modules/segregation";
import { SOURCES, WASTE_FACTS } from "@/shared/content/facts";
import { MEDIA } from "@/shared/content/media";
import { ImageReveal } from "@/shared/motion/image-reveal";
import { Reveal, RevealGroup, RevealItem } from "@/shared/motion/reveal";
import { ButtonLink } from "@/shared/ui/button";
import { Icon, type IconName } from "@/shared/ui/icon";
import { Section, SectionHeading } from "@/shared/ui/section";

export const metadata: Metadata = {
  title: "Segregación en la fuente",
  description:
    "Qué va en la bolsa verde, marrón, negra y roja según la NTP 900.058:2019, días de recojo, un juego para practicar y un buscador para saber dónde botar cada objeto.",
};

const SHARES: readonly Share[] = [
  {
    label: "Orgánicos",
    fate: "Compost en la planta municipal",
    share: WASTE_FACTS.organicShare,
    swatch: "var(--color-organico)",
    icon: "leaf",
  },
  {
    label: "Aprovechables",
    fate: "Recicladores formalizados",
    share: WASTE_FACTS.recyclableShare,
    swatch: "var(--color-aprovechable)",
    icon: "recycle",
  },
  {
    label: "No aprovechables",
    fate: "Relleno sanitario de Itapalluni",
    share: WASTE_FACTS.residualShare,
    swatch: "var(--color-no-aprovechable)",
    icon: "trash",
  },
];

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
    title: "Pasa el recojo selectivo",
    text: "El vehículo de recolección selectiva pasa el día y la hora que te indica el promotor. Lo recuperado llega a recicladores formalizados.",
  },
];

const HABITS: readonly { icon: IconName; title: string; text: string }[] = [
  { icon: "sprout", title: "Vacía y enjuaga", text: "Los envases sucios contaminan el papel y el cartón de la misma bolsa." },
  { icon: "arrowDown", title: "Aplasta", text: "Botellas, latas y cajas aplastadas ocupan menos en tu casa y en el camión." },
  { icon: "leaf", title: "Escurre los orgánicos", text: "Menos líquido es menos olor, menos moscas y un mejor compost." },
  { icon: "clock", title: "Saca la bolsa a tiempo", text: "Solo cuando el camión está por pasar, nunca en la esquina antes de hora." },
];

export default function SegregacionPage() {
  return (
    <>
      <SegregationHero
        bins={BINS}
        photo={MEDIA.recoleccionSelectiva}
        lede="El 84 % de lo que bota un hogar puneño se puede aprovechar. Para lograrlo, cada residuo tiene que salir de casa en la bolsa correcta."
      />

      {/* Qué hay en la bolsa */}
      <Section tone="tint" aria-labelledby="bolsa-titulo">
        <div className="shell">
          <SectionHeading id="bolsa-titulo" eyebrow="Puno en cifras" title="¿Qué hay en la bolsa de basura de tu casa?" />
          <WasteComposition shares={SHARES} recoverable={WASTE_FACTS.recoverableShare} />
          <p className="mt-10 text-sm text-pizarra">
            Fuente:{" "}
            <a
              href={SOURCES.ecrs2015.url}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-puno underline underline-offset-4"
            >
              {SOURCES.ecrs2015.label}
              <span className="sr-only"> (se abre en otra pestaña)</span>
            </a>
            .
          </p>
        </div>
      </Section>

      {/* Los cuatro colores */}
      <BinBands bins={BINS} />

      {/* Juego */}
      <Section tone="white" id="juego" aria-labelledby="juego-titulo">
        <div className="shell">
          <SectionHeading
            id="juego-titulo"
            eyebrow="Juega y aprende"
            title="¿En qué bolsa va?"
            lede={
              <>
                Pon a prueba lo que sabes del código de colores{" "}
                <a href={SOURCES.ntp.url} target="_blank" rel="noreferrer" className="font-semibold text-puno underline underline-offset-4">
                  NTP 900.058:2019
                  <span className="sr-only"> (se abre en otra pestaña)</span>
                </a>
                .
              </>
            }
            align="center"
          />
          <SortingGame items={ITEMS} bins={BINS} />
        </div>
      </Section>

      {/* Buscador */}
      <Section tone="tint" id="buscador" aria-labelledby="buscador-titulo">
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

      {/* Programa de la bolsa verde */}
      <Section tone="brand" aria-labelledby="programa" className="overflow-hidden">
        <div className="shell grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div className="relative pb-16 sm:pb-20">
            <ImageReveal media={MEDIA.acopioColegio} sizes="(min-width: 1024px) 40vw, 90vw" className="aspect-4/3 rounded-3xl sm:w-[86%]" />
            <ImageReveal
              media={MEDIA.recicladores}
              sizes="(min-width: 1024px) 22vw, 50vw"
              from="left"
              parallax={20}
              className="absolute right-0 bottom-0 aspect-4/3 w-[52%] rounded-3xl ring-8 ring-puno-800"
            />
          </div>
          <div>
            <SectionHeading
              id="programa"
              tone="light"
              eyebrow="Programa de segregación y recolección selectiva"
              title="Así funciona la bolsa verde"
              className="mb-8"
            />
            <RevealGroup
              as="ol"
              className="relative space-y-8 before:absolute before:top-2 before:bottom-2 before:left-6 before:w-0.5 before:bg-white/20"
            >
              {PROGRAM.map((p, i) => (
                <RevealItem as="li" key={p.title} className="relative flex gap-5">
                  <span className="relative grid size-12 shrink-0 place-items-center rounded-full bg-brote text-noche ring-8 ring-puno-800">
                    <Icon name={p.icon} size={22} />
                  </span>
                  <span>
                    <span className="text-xs font-extrabold tracking-[0.14em] text-brote uppercase">Paso {i + 1}</span>
                    <h3 className="mt-1 text-xl font-extrabold">{p.title}</h3>
                    <p className="mt-1.5 leading-relaxed text-white/80">{p.text}</p>
                  </span>
                </RevealItem>
              ))}
            </RevealGroup>
            <ButtonLink href="/rutas" variant="white" icon="arrow" className="mt-10">
              Días de recojo de mi ruta
            </ButtonLink>
          </div>
        </div>
      </Section>

      {/* Hábitos */}
      <Section tone="white" aria-labelledby="habitos">
        <div className="shell">
          <SectionHeading id="habitos" eyebrow="Buenas prácticas" title="Cuatro hábitos que hacen la diferencia" />
          <RevealGroup as="ol" className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {HABITS.map((h, i) => (
              <RevealItem as="li" key={h.title} className="border-t-4 border-brote pt-6">
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-2xl bg-celeste-50 text-puno">
                    <Icon name={h.icon} size={24} />
                  </span>
                  <span className="numeral text-4xl text-niebla">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-puno-800">{h.title}</h3>
                <p className="mt-1.5 leading-relaxed text-pizarra">{h.text}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Section>

      {/* Llamado final */}
      <section aria-labelledby="camion-titulo" className="bg-brote py-12 text-noche md:py-14">
        <Reveal className="shell flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-noche text-brote">
              <Icon name="truck" size={28} />
            </span>
            <div>
              <h2 id="camion-titulo" className="text-xl font-extrabold md:text-2xl">
                ¿Qué día pasa el camión por tu calle?
              </h2>
              <p className="mt-0.5 text-noche/80">Busca tu calle y mira el horario de tu ruta, en vivo.</p>
            </div>
          </div>
          <Link
            href="/rutas"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-noche px-6 font-bold text-white transition-colors hover:bg-puno-800 md:self-auto"
          >
            Ver rutas y horarios
            <Icon name="arrow" size={18} />
          </Link>
        </Reveal>
      </section>
    </>
  );
}
