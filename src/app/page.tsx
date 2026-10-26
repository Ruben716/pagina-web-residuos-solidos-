import Image from "next/image";
import { HeroCarousel } from "@/modules/home/hero-carousel";
import { SLIDES } from "@/modules/home/slides";
import { FacebookTeaser } from "@/modules/facebook";
import { ArticleList, FeaturedArticle, getArticles } from "@/modules/news";
import { FIGURES, OFFICE_SOURCES, OrgChart, PortalLinks, WORK_LINES, WorkLines } from "@/modules/office";
import { SITE } from "@/shared/config/site";
import { MEDIA } from "@/shared/content/media";
import { Counter } from "@/shared/motion/counter";
import { ImageReveal } from "@/shared/motion/image-reveal";
import { Reveal, RevealGroup, RevealItem } from "@/shared/motion/reveal";
import { ButtonLink } from "@/shared/ui/button";
import { Icon, type IconName } from "@/shared/ui/icon";
import { Section, SectionHeading } from "@/shared/ui/section";

const PILLARS: readonly { icon: IconName; title: string; text: string }[] = [
  { icon: "home", title: "Ciudad limpia", text: "Barrido y recolección en los cuatro sectores, todos los días." },
  { icon: "recycle", title: "Residuos que vuelven a servir", text: "Compost con lo orgánico y reciclaje con recicladores formalizados." },
  { icon: "users", title: "Vecinos que participan", text: "Segregación en casa, campañas Sumaq Ayni y reportes ciudadanos." },
];

export default function Home() {
  const [featured, ...more] = getArticles();

  return (
    <>
      <HeroCarousel slides={SLIDES} title={`${SITE.office} de la ${SITE.institution}`} />

      {/* Quiénes somos */}
      <Section tone="tint" id="gerencia" aria-labelledby="gerencia-titulo" className="overflow-hidden">
        <div className="shell grid items-center gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-20">
          <div>
            <SectionHeading
              id="gerencia-titulo"
              eyebrow="Quiénes somos"
              title="La gerencia que mantiene limpia la ciudad de Puno"
              className="mb-6 md:mb-8"
            />
            <Reveal className="space-y-4 text-lg leading-relaxed text-pizarra">
              <p>
                La <strong className="font-bold text-tinta">{SITE.office}</strong> es el órgano de la {SITE.institution} que se encarga de
                que los residuos de la ciudad se recojan, se aprovechen y terminen en un lugar seguro.
              </p>
              <p>
                Trabaja con dos subgerencias: <strong className="font-bold text-tinta">Limpieza Pública y Recolección</strong>, en la calle,
                y <strong className="font-bold text-tinta">Valorización y Disposición Final</strong>, en la planta de compostaje y el
                relleno sanitario de Itapalluni. Su meta: que cada vez menos residuos lleguen al relleno y al lago Titicaca.
              </p>
            </Reveal>
            <RevealGroup as="ul" className="mt-10 grid gap-6 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-niebla">
              {PILLARS.map((p) => (
                <RevealItem as="li" key={p.title} className="sm:px-5 sm:first:pl-0 sm:last:pr-0">
                  <span className="grid size-11 place-items-center rounded-xl bg-puno text-white">
                    <Icon name={p.icon} size={22} />
                  </span>
                  <h3 className="mt-3 font-extrabold text-puno-800">{p.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-pizarra">{p.text}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>

          <div className="relative pb-16 sm:pb-20 lg:pl-6">
            <div aria-hidden className="absolute -top-10 -right-24 size-80 rounded-full bg-brote/25 blur-3xl" />
            <ImageReveal
              media={MEDIA.equipoCampo}
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="aspect-4/5 rounded-[2rem] sm:w-[85%]"
            />
            <ImageReveal
              media={MEDIA.acopioColegio}
              sizes="(min-width: 1024px) 22vw, 50vw"
              from="left"
              parallax={20}
              className="absolute right-0 bottom-0 aspect-4/3 w-[55%] rounded-3xl ring-8 ring-cielo"
            />
            <Reveal delay={0.4} className="absolute top-8 -left-2 sm:-left-6">
              <p className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-float">
                <span className="grid size-10 place-items-center rounded-xl bg-brote/30 text-puno-800">
                  <Icon name="leaf" size={20} />
                </span>
                <span className="text-sm leading-tight font-bold text-puno-800">
                  De la calle
                  <br />
                  <span className="font-semibold text-pizarra">al relleno sanitario</span>
                </span>
              </p>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* Qué hacemos */}
      <Section tone="brand" id="que-hacemos" aria-labelledby="que-hacemos-titulo" className="overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-40 -left-40 size-[34rem] rounded-full bg-[radial-gradient(circle,rgb(159_211_86/0.18),transparent_70%)]"
        />
        <div
          aria-hidden
          className="absolute -right-32 -bottom-48 size-[30rem] rounded-full bg-[radial-gradient(circle,rgb(26_167_216/0.22),transparent_70%)]"
        />
        <div className="shell relative">
          <SectionHeading
            id="que-hacemos-titulo"
            tone="light"
            eyebrow="Qué hacemos"
            title="Cada residuo tiene un camino, de tu puerta al relleno sanitario"
            lede="Cinco líneas de trabajo a cargo de las dos subgerencias. Pasa el cursor o elige una para conocerla."
          />
          <WorkLines lines={WORK_LINES} />
        </div>
      </Section>

      {/* Servicios del portal */}
      <Section tone="white" aria-labelledby="servicios-titulo">
        <div className="shell">
          <SectionHeading
            id="servicios-titulo"
            eyebrow="Servicios para el vecino"
            title="¿Qué necesitas hoy?"
            lede="Cada servicio tiene su propia sección en este portal."
          />
          <PortalLinks />
        </div>
      </Section>

      {/* Cifras sobre el amanecer en los totorales */}
      <section aria-labelledby="cifras-titulo" className="relative isolate overflow-hidden bg-noche py-20 text-white md:py-28">
        <Image src={MEDIA.amanecerTotorales.src} alt="" fill sizes="100vw" quality={70} className="-z-20 object-cover" />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(8_48_31/0.35)_0%,rgb(8_48_31/0.55)_55%,rgb(8_48_31/0.92)_100%)]"
        />
        <div className="shell">
          <SectionHeading
            id="cifras-titulo"
            tone="light"
            eyebrow="Puno en cifras"
            title="Lo que genera la ciudad y lo que podemos recuperar"
            align="center"
          />
          <RevealGroup as="ul" className="grid gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-white/20">
            {FIGURES.map((f) => (
              <RevealItem as="li" key={f.label} className="text-center lg:px-6">
                <p className="numeral text-[clamp(3rem,6vw,4.5rem)] [text-shadow:0_2px_18px_rgb(0_0_0/0.35)]">
                  {f.prefix}
                  <Counter value={f.value} suffix={f.suffix} />
                </p>
                <p className="mx-auto mt-3 max-w-[22ch] font-semibold text-white/90">{f.label}</p>
              </RevealItem>
            ))}
          </RevealGroup>
          <p className="mt-14 text-center text-xs text-white/75">
            Fuentes:{" "}
            {(["generacion", "mercados", "centro"] as const).map((k, i) => (
              <span key={k}>
                {i > 0 && " · "}
                <a href={OFFICE_SOURCES[k].url} target="_blank" rel="noreferrer" className="underline hover:text-white">
                  {OFFICE_SOURCES[k].label}
                  <span className="sr-only"> (se abre en otra pestaña)</span>
                </a>
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* Organización y atención */}
      <Section tone="soft" id="organizacion" aria-labelledby="organizacion-titulo">
        <div className="shell">
          <SectionHeading
            id="organizacion-titulo"
            eyebrow="Organización"
            title="Quiénes están a cargo"
            lede="La gerencia y sus dos subgerencias. Escríbeles directamente o acércate al Palacio Municipal."
          />
          <OrgChart />
        </div>
      </Section>

      {/* Actualidad */}
      <Section tone="brand" aria-labelledby="noticias" className="overflow-hidden">
        <div aria-hidden className="lake-waves absolute inset-x-0 bottom-10 text-white/10" />
        <div
          aria-hidden
          className="absolute -top-40 -right-32 size-[34rem] rounded-full bg-[radial-gradient(circle,rgb(26_167_216/0.25),transparent_70%)]"
        />
        <div className="shell relative">
          <SectionHeading
            id="noticias"
            tone="light"
            eyebrow="Sala de prensa"
            title="Notas de prensa"
            action={
              <ButtonLink href="/noticias" variant="white" icon="arrow">
                Todas las notas
              </ButtonLink>
            }
          />
          <FeaturedArticle article={featured} />
          <div className="mt-6">
            <ArticleList articles={more.slice(0, 3)} />
          </div>
        </div>
      </Section>

      {/* Últimas publicaciones de Facebook: solo si hay */}
      <FacebookTeaser />

      {/* Reporta */}
      <section aria-labelledby="reporta-titulo" className="bg-cielo py-16 md:py-20">
        <div className="shell">
          <Reveal className="relative isolate overflow-hidden rounded-3xl bg-puno px-6 py-10 text-white md:px-12 md:py-12">
            <div aria-hidden className="lake-waves absolute inset-x-0 bottom-6 -z-10 text-white/15" />
            <div
              aria-hidden
              className="absolute -top-24 -right-16 -z-10 size-72 rounded-full bg-[radial-gradient(circle,rgb(159_211_86/0.45),transparent_70%)]"
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
