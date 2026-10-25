import type { Metadata } from "next";
import { Suspense } from "react";
import { TicketStatus } from "@/modules/reports";
import { MEDIA } from "@/shared/content/media";
import { Button } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import { PageHero } from "@/shared/ui/page-hero";
import { Section } from "@/shared/ui/section";

export const metadata: Metadata = {
  title: "Seguimiento de reportes",
  description: "Consulta con tu código en qué etapa está la atención de tu reporte de punto crítico.",
};

export default function SeguimientoPage({ searchParams }: PageProps<"/reporta/seguimiento">) {
  return (
    <>
      <PageHero
        eyebrow="Reporta a tu vecino"
        title="Sigue tu reporte"
        crumbs={[
          { href: "/reporta", label: "Reporta a tu vecino" },
          { href: "/reporta/seguimiento", label: "Seguimiento" },
        ]}
        lede="Escribe el código que recibiste al enviar tu reporte para ver en qué etapa está la atención."
        image={MEDIA.cuadrillaLimpieza}
        focus="50% 40%"
      >
        <form action="/reporta/seguimiento" className="flex w-full max-w-xl flex-col gap-3 rounded-2xl bg-white p-2 sm:flex-row">
          <label htmlFor="codigo" className="sr-only">
            Código del reporte
          </label>
          <span className="flex flex-1 items-center gap-3 px-3">
            <Icon name="ticket" className="shrink-0 text-puno" />
            <input
              id="codigo"
              name="codigo"
              required
              placeholder="MPP-2610-K7QD"
              autoCapitalize="characters"
              spellCheck={false}
              className="numeral min-h-12 flex-1 bg-transparent text-xl tracking-[0.06em] text-tinta uppercase outline-none placeholder:text-pizarra/60 focus-visible:shadow-none focus-visible:outline-none"
            />
          </span>
          <Button type="submit" icon="search">
            Consultar
          </Button>
        </form>
      </PageHero>
      <Section tone="soft" className="min-h-[40vh]">
        <div className="shell">
          <Suspense fallback={<p className="text-pizarra">Buscando tu reporte…</p>}>
            <Result searchParams={searchParams} />
          </Suspense>
        </div>
      </Section>
    </>
  );
}

async function Result({ searchParams }: Pick<PageProps<"/reporta/seguimiento">, "searchParams">) {
  const { codigo } = await searchParams;
  const code = Array.isArray(codigo) ? codigo[0] : codigo;
  if (!code) {
    return (
      <div className="flex max-w-2xl items-start gap-4 rounded-2xl bg-white p-6 ring-1 ring-bruma">
        <Icon name="info" size={24} className="shrink-0 text-puno" />
        <p className="text-lg text-pizarra">Cuando consultes un código, aquí verás las etapas de atención de tu reporte.</p>
      </div>
    );
  }
  return <TicketStatus code={code} />;
}
