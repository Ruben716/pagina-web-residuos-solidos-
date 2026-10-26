import type { Metadata } from "next";
import Link from "next/link";
import { getPageCopy, getPageMetadata } from "@/modules/copy";
import {
  BinBands,
  type BinId,
  getSegregationContent,
  SegregationHero,
  type Share,
  SortingGame,
  WasteComposition,
  WhereDoesItGo,
} from "@/modules/segregation";
import { SOURCES, WASTE_FACTS } from "@/shared/content/facts";
import { ImageReveal } from "@/shared/motion/image-reveal";
import { Reveal, RevealGroup, RevealItem } from "@/shared/motion/reveal";
import { ButtonLink } from "@/shared/ui/button";
import { Icon, type IconName } from "@/shared/ui/icon";
import { Section, SectionHeading } from "@/shared/ui/section";
import { getSiteMedia } from "@/modules/media";
import type { Media } from "@/shared/content/media";

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("segregacion");
}

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

// íconos de los pasos y los hábitos, en orden (los textos se editan en el panel)
const PROGRAM_ICONS: readonly IconName[] = ["users", "recycle", "truck"];
const HABIT_ICONS: readonly IconName[] = ["sprout", "arrowDown", "leaf", "clock"];

export default async function SegregacionPage() {
  const [t, media, { bins: BINS, items: ITEMS }] = await Promise.all([getPageCopy("segregacion"), getSiteMedia(), getSegregationContent()]);
  return (
    <>
      <SegregationHero bins={BINS} photo={media.recoleccionSelectiva} copy={t.hero} />

      {/* Qué hay en la bolsa */}
      <Section tone="tint" aria-labelledby="bolsa-titulo">
        <div className="shell">
          <SectionHeading id="bolsa-titulo" eyebrow={t.bolsa.eyebrow} title={t.bolsa.title} />
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
      <BinBands bins={BINS} photos={Object.fromEntries(BINS.map((b) => [b.id, media[b.image]])) as Record<BinId, Media>} />

      {/* Juego */}
      <Section tone="white" id="juego" aria-labelledby="juego-titulo">
        <div className="shell">
          <SectionHeading
            id="juego-titulo"
            eyebrow={t.juego.eyebrow}
            title={t.juego.title}
            lede={
              <>
                {t.juego.lede}{" "}
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
          <SectionHeading id="buscador-titulo" eyebrow={t.buscador.eyebrow} title={t.buscador.title} lede={t.buscador.lede} />
          <WhereDoesItGo items={ITEMS} bins={BINS} />
        </div>
      </Section>

      {/* Programa de la bolsa verde */}
      <Section tone="brand" aria-labelledby="programa" className="overflow-hidden">
        <div className="shell grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div className="relative pb-16 sm:pb-20">
            <ImageReveal media={media.acopioColegio} sizes="(min-width: 1024px) 40vw, 90vw" className="aspect-4/3 rounded-3xl sm:w-[86%]" />
            <ImageReveal
              media={media.recicladores}
              sizes="(min-width: 1024px) 22vw, 50vw"
              from="left"
              parallax={20}
              className="absolute right-0 bottom-0 aspect-4/3 w-[52%] rounded-3xl ring-8 ring-puno-800"
            />
          </div>
          <div>
            <SectionHeading id="programa" tone="light" eyebrow={t.programa.eyebrow} title={t.programa.title} className="mb-8" />
            <RevealGroup
              as="ol"
              className="relative space-y-8 before:absolute before:top-2 before:bottom-2 before:left-6 before:w-0.5 before:bg-white/20"
            >
              {t.programa.items.map((p, i) => (
                <RevealItem as="li" key={i} className="relative flex gap-5">
                  <span className="relative grid size-12 shrink-0 place-items-center rounded-full bg-brote text-noche ring-8 ring-puno-800">
                    <Icon name={PROGRAM_ICONS[i]} size={22} />
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
              {t.programa.button}
            </ButtonLink>
          </div>
        </div>
      </Section>

      {/* Hábitos */}
      <Section tone="white" aria-labelledby="habitos">
        <div className="shell">
          <SectionHeading id="habitos" eyebrow={t.habitos.eyebrow} title={t.habitos.title} />
          <RevealGroup as="ol" className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {t.habitos.items.map((h, i) => (
              <RevealItem as="li" key={i} className="border-t-4 border-brote pt-6">
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-2xl bg-celeste-50 text-puno">
                    <Icon name={HABIT_ICONS[i]} size={24} />
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
                {t.camion.title}
              </h2>
              <p className="mt-0.5 text-noche/80">{t.camion.text}</p>
            </div>
          </div>
          <Link
            href="/rutas"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-noche px-6 font-bold text-white transition-colors hover:bg-puno-800 md:self-auto"
          >
            {t.camion.button}
            <Icon name="arrow" size={18} />
          </Link>
        </Reveal>
      </section>
    </>
  );
}
