import type { Metadata } from "next";
import { Suspense } from "react";
import { getRoutes, getSectors, plannerView, RoutePlannerFromUrl, RoutesTable } from "@/modules/routes";
import { MEDIA } from "@/shared/content/media";
import { RevealGroup, RevealItem } from "@/shared/motion/reveal";
import { Icon, type IconName } from "@/shared/ui/icon";
import { PageHero } from "@/shared/ui/page-hero";
import { Section, SectionHeading } from "@/shared/ui/section";

export const metadata: Metadata = {
  title: "Rutas y horarios de recolección",
  description: "Mapa de las 29 rutas de recolección de residuos de Puno: por dónde pasa el camión, qué días y a qué hora.",
};

const TIPS: readonly { icon: IconName; title: string; text: string }[] = [
  {
    icon: "clock",
    title: "Saca la bolsa a tiempo",
    text: "Hazlo poco antes de que pase el camión. Una bolsa en la esquina antes de hora se rompe y se esparce.",
  },
  {
    icon: "trash",
    title: "Bolsas cerradas y separadas",
    text: "Entrega tus residuos separados por color y en bolsas bien amarradas, sin líquidos.",
  },
  {
    icon: "alert",
    title: "¿No pasó el camión?",
    text: "Revisa que hoy sea día de servicio de tu ruta. Si lo era, repórtalo y guarda tu basura dentro de casa.",
  },
];

export default function RutasPage() {
  const routes = plannerView();
  const sectors = getSectors();

  return (
    <>
      <PageHero
        eyebrow="Sistema integral de limpieza pública"
        title="Rutas y horarios de recolección"
        crumbs={[{ href: "/rutas", label: "Rutas y horarios" }]}
        lede="Las 29 rutas de recolección cubren los cuatro sectores de la ciudad en tres turnos. Busca tu calle o elige tu ruta para ver su recorrido en el mapa."
        image={MEDIA.recoleccionSelectiva}
        focus="60% 40%"
      />

      <Section tone="white" aria-labelledby="mapa-titulo" className="pt-10 md:pt-14">
        <div className="shell">
          <h2 id="mapa-titulo" className="sr-only">
            Mapa de rutas
          </h2>
          <Suspense fallback={<div className="h-208 animate-pulse rounded-3xl bg-cielo" />}>
            <RoutePlannerFromUrl routes={routes} sectors={sectors} />
          </Suspense>
        </div>
      </Section>

      <Section tone="soft" id="horarios" aria-labelledby="horarios-titulo">
        <div className="shell">
          <SectionHeading
            id="horarios-titulo"
            eyebrow="Cuadro de horarios"
            title="Horarios por sector"
            lede="Horario programado de cada ruta. El estado “ahora” se calcula con la hora de Puno y puede variar por tráfico, clima o mantenimiento de la unidad."
          />
          <RoutesTable sectors={sectors} routes={getRoutes()} />
        </div>
      </Section>

      <Section tone="white" aria-labelledby="consejos-titulo">
        <div className="shell">
          <SectionHeading id="consejos-titulo" eyebrow="Recomendaciones" title="Antes de sacar tu basura" align="center" />
          <RevealGroup as="ul" className="grid gap-6 md:grid-cols-3">
            {TIPS.map((t) => (
              <RevealItem as="li" key={t.title} className="rounded-2xl border border-bruma p-6">
                <span className="grid size-12 place-items-center rounded-xl bg-celeste-50 text-puno">
                  <Icon name={t.icon} size={24} />
                </span>
                <h3 className="mt-4 text-lg font-extrabold text-puno-800">{t.title}</h3>
                <p className="mt-2 leading-relaxed text-pizarra">{t.text}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Section>
    </>
  );
}
