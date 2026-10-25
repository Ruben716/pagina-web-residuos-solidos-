import type { Metadata } from "next";
import Image from "next/image";
import { CampaignIndex, getCampaignRows } from "@/modules/campaigns";
import { MEDIA } from "@/shared/content/media";
import { Counter } from "@/shared/motion/counter";
import { Reveal, RevealGroup, RevealItem } from "@/shared/motion/reveal";
import { Icon, type IconName } from "@/shared/ui/icon";
import { PageHero } from "@/shared/ui/page-hero";
import { Section, SectionHeading } from "@/shared/ui/section";

export const metadata: Metadata = {
  title: "Sumaq Ayni: campañas y voluntariado ambiental",
  description:
    "Calendario de reciclatones, limpiezas de la ribera del Titicaca, ecotrueques, talleres de compostaje y campañas de acopio en Puno.",
};

const LINES: readonly { icon: IconName; title: string; text: string }[] = [
  {
    icon: "recycle",
    title: "Ecotrueques",
    text: "Canjea botellas PET, papel y cartón limpios por plantones nativos y abono del vivero municipal.",
  },
  {
    icon: "heart",
    title: "Limpieza del lago",
    text: "Brigadas vecinales retiran plásticos de la ribera de la bahía interior del Titicaca.",
  },
  {
    icon: "sprout",
    title: "Educación ambiental",
    text: "Talleres de compostaje y segregación para colegios, juntas vecinales y mercados.",
  },
  {
    icon: "alert",
    title: "Acopio de peligrosos",
    text: "Jornadas para entregar pilas, focos y aparatos en desuso con disposición segura.",
  },
];

export default async function CampanasPage() {
  const { upcoming, past } = await getCampaignRows();
  return (
    <>
      <PageHero
        eyebrow="Conciencia ambiental puneña"
        title="Sumaq Ayni: campañas y eventos ambientales"
        crumbs={[{ href: "/campanas", label: "Sumaq Ayni" }]}
        lede="El ayni andino aplicado al cuidado de nuestra tierra y del lago Titicaca: la ayuda que das hoy vuelve a tu comunidad mañana. Súmate a las jornadas de reciclaje, limpieza y voluntariado."
        image={MEDIA.recicladores}
        focus="50% 35%"
      />

      <Section tone="white" aria-labelledby="programa">
        <div className="shell grid items-center gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <div className="overflow-hidden rounded-3xl shadow-panel ring-1 ring-bruma">
              <Image
                src={MEDIA.sumaqAyni.src}
                alt={MEDIA.sumaqAyni.alt}
                width={MEDIA.sumaqAyni.width}
                height={MEDIA.sumaqAyni.height}
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="h-auto w-full"
              />
            </div>
          </Reveal>
          <div className="lg:col-span-7">
            <SectionHeading
              id="programa"
              eyebrow="Bonito intercambio"
              title="Qué hacemos en Sumaq Ayni"
              lede="Sumaq Ayni es el programa de participación vecinal de la Municipalidad para reducir, reaprovechar y limpiar la ciudad."
              className="mb-8 md:mb-8"
            />
            <RevealGroup as="ul" className="grid gap-4 sm:grid-cols-2">
              {LINES.map((l) => (
                <RevealItem as="li" key={l.title} className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-celeste-50 text-puno">
                    <Icon name={l.icon} size={22} />
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
          <SectionHeading
            id="proximas-titulo"
            eyebrow="Agenda"
            title="Próximas jornadas"
            lede="Inscríbete con tu nombre y celular. Te escribimos un día antes con el punto de encuentro."
          />
          {upcoming.length ? (
            <CampaignIndex rows={upcoming} />
          ) : (
            <p className="rounded-2xl bg-white p-6 text-lg text-pizarra">
              Estamos preparando el próximo calendario. Vuelve pronto o síguenos en redes.
            </p>
          )}
        </div>
      </Section>

      <Section tone="brand" aria-labelledby="impacto" className="overflow-hidden">
        <div aria-hidden className="lake-waves absolute inset-x-0 bottom-8 text-white/10" />
        <div className="shell relative">
          <SectionHeading id="impacto" tone="light" eyebrow="Resultados" title="Lo que logramos juntos" align="center" />
          <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { value: 15, suffix: " t", label: "Toneladas recuperadas", note: "Reciclables retirados en jornadas" },
              { value: 8, suffix: "", label: "Puntos críticos erradicados", note: "Rehabilitados como áreas limpias" },
              { value: 1200, suffix: "", label: "Voluntarios", note: "Vecinos puneños activos" },
              { value: 3, suffix: "", label: "Campañas realizadas", note: "Jornadas masivas Sumaq Ayni" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col rounded-2xl bg-white/8 p-6 text-center ring-1 ring-white/15">
                <dt className="font-bold">{s.label}</dt>
                <dd className="order-first">
                  <Counter value={s.value} suffix={s.suffix} className="numeral text-5xl text-white" />
                </dd>
                <dd className="mt-1 text-sm text-white/70">{s.note}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-center text-sm text-white/65">
            Cifras reportadas por la gerencia en el sitio anterior; se actualizarán con el informe anual.
          </p>
        </div>
      </Section>

      {past.length > 0 && (
        <Section tone="white" aria-labelledby="realizadas">
          <div className="shell">
            <SectionHeading id="realizadas" eyebrow="Archivo" title="Jornadas realizadas" />
            <CampaignIndex rows={past} />
          </div>
        </Section>
      )}
    </>
  );
}
