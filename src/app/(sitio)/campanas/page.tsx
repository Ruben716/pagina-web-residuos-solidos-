import type { Metadata } from "next";
import Image from "next/image";
import { getPageCopy, getPageMetadata } from "@/modules/copy";
import { CampaignIndex, getCampaignRows, getCampaigns } from "@/modules/campaigns";
import { Counter } from "@/shared/motion/counter";
import { Reveal, RevealGroup, RevealItem } from "@/shared/motion/reveal";
import { Icon, type IconName } from "@/shared/ui/icon";
import { PageHero } from "@/shared/ui/page-hero";
import { Section, SectionHeading } from "@/shared/ui/section";
import { getSiteMedia, mediaFor } from "@/modules/media";

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("campanas");
}

/** íconos de las líneas del programa, en orden (los textos se editan en el panel) */
const LINE_ICONS: readonly IconName[] = ["recycle", "heart", "sprout", "alert"];

/** cifras de resultados: el número aquí, qué mide y su detalle en el panel (Textos → Campañas) */
const IMPACT: readonly { value: number; suffix: string }[] = [
  { value: 15, suffix: " t" },
  { value: 8, suffix: "" },
  { value: 1200, suffix: "" },
  { value: 3, suffix: "" },
];

export default async function CampanasPage() {
  const [t, media, campaigns] = await Promise.all([getPageCopy("campanas"), getSiteMedia(), getCampaigns()]);
  const { upcoming, past } = await getCampaignRows(campaigns);
  return (
    <>
      <PageHero
        eyebrow={t.hero.eyebrow}
        title={t.hero.title}
        crumbs={[{ href: "/campanas", label: "Sumaq Ayni" }]}
        lede={t.hero.lede}
        image={media.recicladores}
        focus="50% 35%"
      />

      <Section tone="white" aria-labelledby="programa">
        <div className="shell grid items-center gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <div className="overflow-hidden rounded-3xl shadow-panel ring-1 ring-bruma">
              <Image
                src={media.sumaqAyni.src}
                alt={media.sumaqAyni.alt}
                width={media.sumaqAyni.width}
                height={media.sumaqAyni.height}
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="h-auto w-full"
              />
            </div>
          </Reveal>
          <div className="lg:col-span-7">
            <SectionHeading
              id="programa"
              eyebrow={t.programa.eyebrow}
              title={t.programa.title}
              lede={t.programa.lede}
              className="mb-8 md:mb-8"
            />
            <RevealGroup as="ul" className="grid gap-4 sm:grid-cols-2">
              {t.programa.items.map((l, i) => (
                <RevealItem as="li" key={i} className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-celeste-50 text-puno">
                    <Icon name={LINE_ICONS[i]} size={22} />
                  </span>
                  <span>
                    <span className="block font-extrabold text-puno-800">{l.title}</span>
                    <span className="mt-0.5 block text-sm leading-relaxed text-pizarra">{l.text}</span>
                  </span>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </div>
      </Section>

      <Section tone="soft" id="proximas" aria-labelledby="proximas-titulo">
        <div className="shell">
          <SectionHeading id="proximas-titulo" eyebrow={t.proximas.eyebrow} title={t.proximas.title} lede={t.proximas.lede} />
          {upcoming.length ? (
            <CampaignIndex rows={upcoming.map((r) => ({ ...r, media: mediaFor(media, r.image) }))} />
          ) : (
            <p className="rounded-2xl bg-white p-6 text-lg text-pizarra">{t.proximas.empty}</p>
          )}
        </div>
      </Section>

      <Section tone="brand" aria-labelledby="impacto" className="overflow-hidden">
        <div aria-hidden className="lake-waves absolute inset-x-0 bottom-8 text-white/10" />
        <div className="shell relative">
          <SectionHeading id="impacto" tone="light" eyebrow={t.impacto.eyebrow} title={t.impacto.title} align="center" />
          <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {IMPACT.map((s, i) => (
              <div key={i} className="flex flex-col rounded-2xl bg-white/8 p-6 text-center ring-1 ring-white/15">
                <dt className="font-bold">{t.impacto.items[i].title}</dt>
                <dd className="order-first">
                  <Counter value={s.value} suffix={s.suffix} className="numeral text-5xl text-white" />
                </dd>
                <dd className="mt-1 text-sm text-white/70">{t.impacto.items[i].text}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-center text-sm text-white/65">{t.impacto.note}</p>
        </div>
      </Section>

      {past.length > 0 && (
        <Section tone="white" aria-labelledby="realizadas">
          <div className="shell">
            <SectionHeading id="realizadas" eyebrow={t.realizadas.eyebrow} title={t.realizadas.title} />
            <CampaignIndex rows={past.map((r) => ({ ...r, media: mediaFor(media, r.image) }))} />
          </div>
        </Section>
      )}
    </>
  );
}
