import type { Metadata } from "next";
import { Suspense } from "react";
import { getPageCopy, getPageMetadata } from "@/modules/copy";
import { TicketStatus } from "@/modules/reports";
import { Button } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import { PageHero } from "@/shared/ui/page-hero";
import { Section } from "@/shared/ui/section";
import { getSiteMedia } from "@/modules/media";

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("seguimiento");
}

export default async function SeguimientoPage({ searchParams }: PageProps<"/reporta/seguimiento">) {
  const [t, media] = await Promise.all([getPageCopy("seguimiento"), getSiteMedia()]);
  return (
    <>
      <PageHero
        eyebrow={t.hero.eyebrow}
        title={t.hero.title}
        crumbs={[
          { href: "/reporta", label: "Reporta a tu vecino" },
          { href: "/reporta/seguimiento", label: "Seguimiento" },
        ]}
        lede={t.hero.lede}
        image={media.cuadrillaLimpieza}
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
            <Result searchParams={searchParams} empty={t.vacio.text} />
          </Suspense>
        </div>
      </Section>
    </>
  );
}

async function Result({ searchParams, empty }: Pick<PageProps<"/reporta/seguimiento">, "searchParams"> & { empty: string }) {
  const { codigo } = await searchParams;
  const code = Array.isArray(codigo) ? codigo[0] : codigo;
  if (!code) {
    return (
      <div className="flex max-w-2xl items-start gap-4 rounded-2xl bg-white p-6 ring-1 ring-bruma">
        <Icon name="info" size={24} className="shrink-0 text-puno" />
        <p className="text-lg text-pizarra">{empty}</p>
      </div>
    );
  }
  return <TicketStatus code={code} />;
}
