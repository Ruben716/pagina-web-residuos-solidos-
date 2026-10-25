import type { Metadata } from "next";
import { Suspense } from "react";
import { ReportWizard } from "@/modules/reports";
import { MEDIA } from "@/shared/content/media";
import { Reveal, RevealGroup, RevealItem } from "@/shared/motion/reveal";
import { ButtonLink } from "@/shared/ui/button";
import { Icon, type IconName } from "@/shared/ui/icon";
import { PageHero } from "@/shared/ui/page-hero";
import { Section, SectionHeading } from "@/shared/ui/section";

export const metadata: Metadata = {
  title: "Reporta a tu vecino",
  description: "Denuncia botaderos clandestinos, desmonte o basura fuera de horario en Puno. Recibe un código para seguir la atención.",
};

const FEATURES: readonly { icon: IconName; title: string; text: string }[] = [
  {
    icon: "camera",
    title: "Evidencia fotográfica",
    text: "Adjunta una foto del botadero o del punto crítico para sustentar la intervención.",
  },
  {
    icon: "gps",
    title: "Ubicación exacta",
    text: "Usa el GPS de tu celular o mueve el pin en el mapa para un despacho rápido de las cuadrillas.",
  },
  {
    icon: "ticket",
    title: "Seguimiento con código",
    text: "Recibes un código único para ver en qué etapa está la atención de tu reporte.",
  },
];

export default function ReportaPage() {
  return (
    <>
      <PageHero
        eyebrow="Fiscalización ciudadana"
        title="Reporta a tu vecino y los puntos críticos"
        crumbs={[{ href: "/reporta", label: "Reporta a tu vecino" }]}
        lede="Canal directo para denunciar botaderos clandestinos, desmonte o basura fuera del horario de recojo. Tu reporte llega a fiscalización ambiental."
        image={MEDIA.puntoCritico}
        focus="50% 70%"
      >
        <ButtonLink href="/reporta/seguimiento" variant="white" icon="arrow">
          ¿Ya tienes un código? Consulta tu reporte
        </ButtonLink>
      </PageHero>

      <section className="relative z-10 -mt-8 md:-mt-10">
        <div className="shell">
          <RevealGroup as="ul" className="grid gap-px overflow-hidden rounded-2xl bg-bruma shadow-float ring-1 ring-bruma md:grid-cols-3">
            {FEATURES.map((f, i) => (
              <RevealItem as="li" key={f.title} className="flex gap-4 bg-white p-5 md:p-6">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-celeste-50 text-puno">
                  <Icon name={f.icon} size={24} />
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
              eyebrow="Asistente de reporte municipal"
              title="Envía tu reporte en tres pasos"
              lede="Toma menos de dos minutos. Puedes reportar de forma anónima."
              className="mb-6 md:mb-6"
            />
            <Reveal className="rounded-2xl bg-puno-800 p-6 text-white">
              <p className="flex items-center gap-2 text-sm font-extrabold tracking-[0.1em] text-celeste-200 uppercase">
                <Icon name="scale" size={18} />
                Lo que dice la norma
              </p>
              <p className="mt-3 leading-relaxed text-white/90">
                Arrojar residuos sólidos o desmonte en la vía pública, áreas verdes o la ribera del lago es una infracción sancionable con
                multa.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                Ley de Gestión Integral de Residuos Sólidos (D. Leg. N.° 1278) y ordenanzas de la Municipalidad Provincial de Puno. El monto
                de la multa depende de la ordenanza vigente y de la gravedad de la infracción.
              </p>
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
