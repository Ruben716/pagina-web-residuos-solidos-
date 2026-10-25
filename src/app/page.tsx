import { HeroCarousel } from "@/modules/home/hero-carousel";
import { SLIDES } from "@/modules/home/slides";
import { ArticleList, FeaturedArticle, getArticles } from "@/modules/news";
import { getSectors, plannerView, RoutePlanner } from "@/modules/routes";
import { BINS, BinShowcase } from "@/modules/segregation";
import { SITE } from "@/shared/config/site";
import { Reveal } from "@/shared/motion/reveal";
import { ButtonLink } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import { Section, SectionHeading } from "@/shared/ui/section";

export default function Home() {
  const [featured, ...more] = getArticles();

  return (
    <>
      <HeroCarousel slides={SLIDES} title={`${SITE.office} de la ${SITE.institution}`} />

      {/* Segregación */}
      <Section tone="soft" aria-labelledby="colores">
        <div className="shell">
          <SectionHeading
            id="colores"
            eyebrow="Segregación en la fuente"
            title="Separa tus residuos en cuatro colores"
            lede="Es el código de la NTP 900.058:2019. No necesitas tachos nuevos: bastan bolsas o cajas marcadas, y cada color tiene sus días de recojo."
            action={
              <ButtonLink href="/segregacion#buscador" variant="outline" icon="search">
                ¿Dónde va esto?
              </ButtonLink>
            }
          />
          <BinShowcase bins={BINS} />
        </div>
      </Section>

      {/* Rutas: banda azul compacta + mapa; en escritorio la sección ocupa justo una pantalla */}
      <section id="rutas" aria-labelledby="rutas-titulo" className="flex flex-col bg-puno-800 text-white lg:h-svh lg:min-h-[40rem]">
        <div className="relative shrink-0 overflow-hidden">
          <div
            aria-hidden
            className="absolute -top-48 -right-32 size-[30rem] rounded-full bg-[radial-gradient(circle,rgb(0_136_204/0.4),transparent_70%)]"
          />
          <div className="shell relative flex flex-col gap-4 py-6 lg:flex-row lg:items-center lg:gap-8 lg:py-5">
            <div className="shrink-0">
              <p className="text-[0.7rem] font-extrabold tracking-[0.14em] text-celeste-200 uppercase">
                Sistema integral de limpieza pública
              </p>
              <h2 id="rutas-titulo" className="mt-1 text-2xl leading-tight font-extrabold md:text-[1.85rem]">
                Rutas de recolección en Puno
              </h2>
            </div>
            <p className="max-w-[46ch] text-sm leading-relaxed text-white/80 lg:flex-1 lg:border-l lg:border-white/15 lg:pl-8">
              Busca tu calle o elige una ruta: el mapa te muestra por dónde pasa el camión, qué días y a qué hora.
            </p>
            <div className="flex flex-wrap items-center gap-5">
              <dl className="flex gap-5">
                {[
                  ["29", "rutas"],
                  ["4", "sectores"],
                  ["3", "turnos"],
                ].map(([value, label]) => (
                  <div key={label} className="flex items-baseline gap-1.5">
                    <dt className="order-last text-sm text-white/80">{label}</dt>
                    <dd className="numeral text-2xl">{value}</dd>
                  </div>
                ))}
              </dl>
              <ButtonLink href="/rutas#horarios" variant="white" icon="arrow" className="min-h-11 px-4 text-sm">
                Horarios por sector
              </ButtonLink>
            </div>
          </div>
        </div>
        <RoutePlanner routes={plannerView()} sectors={getSectors()} fill />
      </section>

      {/* Actualidad */}
      <Section tone="brand" aria-labelledby="noticias" className="overflow-hidden">
        <div aria-hidden className="lake-waves absolute inset-x-0 bottom-10 text-white/10" />
        <div
          aria-hidden
          className="absolute -top-40 -right-32 size-[34rem] rounded-full bg-[radial-gradient(circle,rgb(0_136_204/0.45),transparent_70%)]"
        />
        <div className="shell relative">
          <SectionHeading
            id="noticias"
            tone="light"
            eyebrow="Actualidad y transparencia ambiental"
            title="Notas de prensa"
            action={
              <ButtonLink href="/noticias" variant="white" icon="arrow">
                Todas las noticias
              </ButtonLink>
            }
          />
          <FeaturedArticle article={featured} />
          <div className="mt-6">
            <ArticleList articles={more.slice(0, 3)} />
          </div>
        </div>
      </Section>

      {/* Reporta */}
      <section aria-labelledby="reporta-titulo" className="bg-cielo py-16 md:py-20">
        <div className="shell">
          <Reveal className="relative isolate overflow-hidden rounded-3xl bg-puno px-6 py-10 text-white md:px-12 md:py-12">
            <div aria-hidden className="lake-waves absolute inset-x-0 bottom-6 -z-10 text-white/15" />
            <div
              aria-hidden
              className="absolute -top-24 -right-16 -z-10 size-72 rounded-full bg-[radial-gradient(circle,rgb(1_160_226/0.55),transparent_70%)]"
            />
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-5">
                <span className="hidden size-14 shrink-0 place-items-center rounded-2xl bg-white/15 sm:grid">
                  <Icon name="camera" size={28} />
                </span>
                <div>
                  <p className="text-sm font-bold tracking-[0.12em] text-celeste-200 uppercase">Fiscalización ciudadana</p>
                  <h2 id="reporta-titulo" className="mt-2 text-2xl font-extrabold md:text-3xl">
                    ¿Una esquina se volvió basural? Repórtala
                  </h2>
                  <p className="mt-2 max-w-[60ch] text-white/85">
                    Envía una foto y la ubicación. El reporte llega a fiscalización y recibes un código para seguir cada etapa, también si
                    lo envías de forma anónima.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <ButtonLink href="/reporta" variant="white" icon="arrow">
                  Reportar ahora
                </ButtonLink>
                <ButtonLink href="/reporta/seguimiento" variant="ghost">
                  Seguir mi reporte
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
