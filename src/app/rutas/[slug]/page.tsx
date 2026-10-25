import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  formatDays,
  formatTime,
  getRoute,
  getRoutes,
  getSector,
  LazyRouteMap,
  neighbours,
  RouteStatus,
  SECTOR_COLOR,
  SHIFT_LABEL,
  WeekStrip,
} from "@/modules/routes";
import { MEDIA } from "@/shared/content/media";
import { formatNumber, pad } from "@/shared/lib/format";
import { Reveal } from "@/shared/motion/reveal";
import { ButtonLink } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import { PageHero } from "@/shared/ui/page-hero";

export function generateStaticParams() {
  return getRoutes().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/rutas/[slug]">): Promise<Metadata> {
  const route = getRoute((await params).slug);
  if (!route) return {};
  return {
    title: `Ruta ${pad(route.number)}: ${route.title}`,
    description: `${formatDays(route.days)}, de ${formatTime(route.start)} a ${formatTime(route.end)}. ${route.description}`,
  };
}

// El shell de la ruta no depende del slug; el detalle llega dentro de Suspense (Partial Prefetching).
export default function RutaPage({ params }: PageProps<"/rutas/[slug]">) {
  return (
    <Suspense fallback={<DetailFallback />}>
      <RutaDetail params={params} />
    </Suspense>
  );
}

function DetailFallback() {
  return <div aria-busy className="min-h-[85svh] bg-cielo" />;
}

async function RutaDetail({ params }: Pick<PageProps<"/rutas/[slug]">, "params">) {
  const route = getRoute((await params).slug);
  if (!route) notFound();
  const sector = getSector(route.sector);
  const { prev, next } = neighbours(route.slug);
  const color = SECTOR_COLOR[route.sector];

  const facts = [
    { label: "Horario", value: `${formatTime(route.start)} a ${formatTime(route.end)}` },
    { label: "Turno", value: SHIFT_LABEL[route.shift] },
    { label: "Días de servicio", value: formatDays(route.days) },
    { label: "Hogares atendidos", value: formatNumber(route.households) },
    { label: "Recorrido aproximado", value: `${formatNumber(route.km, { maximumFractionDigits: 1 })} km` },
    { label: "Unidad asignada", value: route.truck },
  ];

  return (
    <>
      <PageHero
        eyebrow={`Sector ${sector.id} · ${sector.name}`}
        title={`Ruta ${pad(route.number)}: ${route.title}`}
        crumbs={[
          { href: "/rutas", label: "Rutas y horarios" },
          { href: `/rutas/${route.slug}`, label: `Ruta ${pad(route.number)}` },
        ]}
        lede={route.description}
        image={MEDIA.recoleccionSelectiva}
        focus="center 60%"
      >
        <span className="inline-flex min-h-11 items-center rounded-xl bg-white px-4">
          <RouteStatus route={route} className="font-bold text-tinta" />
        </span>
        <WeekStrip days={route.days} tone="dark" />
      </PageHero>

      <section className="bg-white">
        <div className="shell grid gap-10 py-12 md:py-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <h2 className="eyebrow">Ficha de la ruta</h2>
              <dl className="mt-5 divide-y divide-bruma overflow-hidden rounded-2xl border border-bruma">
                {facts.map((f) => (
                  <div key={f.label} className="grid grid-cols-[10rem_1fr] gap-4 px-5 py-4 odd:bg-cielo/60">
                    <dt className="text-sm font-semibold text-pizarra">{f.label}</dt>
                    <dd className="font-bold text-tinta">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal className="mt-10">
              <h2 className="text-xl font-extrabold text-puno-800">Calles del recorrido</h2>
              <ol className="mt-5">
                {route.streets.map((street, i) => {
                  const edge = i === 0 || i === route.streets.length - 1;
                  return (
                    <li key={street} className="relative flex gap-4 pb-4 last:pb-0">
                      <span aria-hidden className="flex flex-col items-center">
                        <span
                          className="mt-1 size-3.5 rounded-full border-[3px]"
                          style={{
                            borderColor: edge ? "transparent" : color,
                            background: edge ? (i === 0 ? "#1f7a3a" : "#c72220") : "#fff",
                          }}
                        />
                        {i < route.streets.length - 1 && <span className="mt-1 w-0.5 flex-1 bg-bruma" />}
                      </span>
                      <span className="-mt-0.5">
                        <span className="font-semibold text-tinta">{street}</span>
                        {edge && <span className="ml-2 text-xs font-bold text-pizarra uppercase">{i === 0 ? "Inicio" : "Fin"}</span>}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </Reveal>

            <Reveal className="mt-10">
              <h2 className="text-xl font-extrabold text-puno-800">Lugares de referencia</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {route.landmarks.map((l) => (
                  <li
                    key={l}
                    className="inline-flex items-center gap-1.5 rounded-full bg-cielo px-3 py-1.5 text-sm font-semibold text-tinta"
                  >
                    <Icon name="pin" size={14} className="text-puno" />
                    {l}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-3xl border border-bruma shadow-panel lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
              <LazyRouteMap routes={[route]} selected={route.slug} className="h-[60vh] min-h-80 lg:h-[34rem]" />
              {route.trace === "referencial" && (
                <p className="flex gap-2 border-t border-bruma bg-cielo px-5 py-3 text-sm text-pizarra">
                  <Icon name="info" size={17} className="mt-0.5 shrink-0 text-puno" />
                  Recorrido referencial: une el inicio y el fin de la ruta. El trazado calle por calle se publicará con el GPS de la unidad.
                </p>
              )}
            </div>
          </div>
        </div>

        {route.photos && (
          <div className="shell grid gap-6 pb-14 md:grid-cols-2">
            {(
              [
                ["start", "Punto de inicio"],
                ["end", "Punto final"],
              ] as const
            ).map(([key, label]) => (
              <figure key={key}>
                <div className="relative aspect-16/10 overflow-hidden rounded-2xl bg-bruma">
                  <Image
                    src={route.photos![key]}
                    alt={`${label} de la ruta ${pad(route.number)}`}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-3 text-sm font-semibold text-pizarra">{label}</figcaption>
              </figure>
            ))}
          </div>
        )}

        <div className="shell pb-14">
          <div className="flex flex-col gap-6 rounded-2xl bg-cielo p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white text-puno">
                <Icon name="alert" size={24} />
              </span>
              <div>
                <p className="text-xl font-extrabold text-puno-800">¿El camión no pasó a la hora indicada?</p>
                <p className="mt-1 text-pizarra">Repórtalo y recibirás un código para seguir la atención.</p>
              </div>
            </div>
            <ButtonLink href={`/reporta?tipo=omision&ruta=${route.slug}`} icon="arrow">
              Reportar omisión de recojo
            </ButtonLink>
          </div>
        </div>

        <nav aria-label="Otras rutas" className="border-t border-bruma">
          <div className="shell grid md:grid-cols-2">
            {[prev, next].map((r, i) =>
              r ? (
                <Link
                  key={r.slug}
                  href={`/rutas/${r.slug}`}
                  className={`group flex items-center gap-5 py-8 transition-colors ${i === 1 ? "md:flex-row-reverse md:border-l md:border-bruma md:pl-8 md:text-right" : "md:pr-8"}`}
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-cielo text-puno transition-colors group-hover:bg-puno group-hover:text-white">
                    <Icon name={i === 0 ? "chevronLeft" : "chevronRight"} size={20} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-pizarra">{i === 0 ? "Ruta anterior" : "Ruta siguiente"}</span>
                    <span className="mt-0.5 block text-lg font-extrabold text-puno-800 group-hover:text-puno">
                      {pad(r.number)} · {r.title}
                    </span>
                  </span>
                </Link>
              ) : (
                <span key={i} />
              ),
            )}
          </div>
        </nav>
      </section>
    </>
  );
}
