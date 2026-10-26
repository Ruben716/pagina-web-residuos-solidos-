import Image from "next/image";
import { getPageCopy, Rich } from "@/modules/copy";
import { FacebookTeaser } from "@/modules/facebook";
import { getSlides, HeroCarousel } from "@/modules/home";
import { getIdentity } from "@/modules/identity";
import { getSiteMedia, mediaFor, pickMedia } from "@/modules/media";
import { ArticleList, FeaturedArticle, getArticles } from "@/modules/news";
import { getOfficeContent, OFFICE_SOURCES, OrgChart, PortalLinks, WorkLines } from "@/modules/office";
import { Counter } from "@/shared/motion/counter";
import { ImageReveal } from "@/shared/motion/image-reveal";
import { Reveal, RevealGroup, RevealItem } from "@/shared/motion/reveal";
import { ButtonLink } from "@/shared/ui/button";
import { Icon, type IconName } from "@/shared/ui/icon";
import { Section, SectionHeading } from "@/shared/ui/section";

/** íconos de los tres pilares, en orden (los textos se editan en el panel) */
const PILLAR_ICONS: readonly IconName[] = ["home", "recycle", "users"];

export default async function Home() {
  const [t, media, identity, { lines: WORK_LINES, figures: FIGURES }, SLIDES, [featured, ...more]] = await Promise.all([
    getPageCopy("inicio"),
    getSiteMedia(),
    getIdentity(),
    getOfficeContent(),
    getSlides(),
    getArticles(),
  ]);

  return (
    <>
      <HeroCarousel
        slides={SLIDES.map((s) => ({ ...s, image: mediaFor(media, s.image) }))}
        title={`${identity.office} de la ${identity.institution}`}
      />

      {/* Quiénes somos */}
      <Section tone="tint" id="gerencia" aria-labelledby="gerencia-titulo" className="overflow-hidden">
        <div className="shell grid items-center gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-20">
          <div>
            <SectionHeading id="gerencia-titulo" eyebrow={t.gerencia.eyebrow} title={t.gerencia.title} className="mb-6 md:mb-8" />
            <Reveal className="space-y-4 text-lg leading-relaxed text-pizarra">
              {[t.gerencia.p1, t.gerencia.p2].map((p, i) => (
                <p key={i}>
                  <Rich text={p} vars={{ gerencia: identity.office, municipalidad: identity.institution }} strong="font-bold text-tinta" />
                </p>
              ))}
            </Reveal>
            <RevealGroup as="ul" className="mt-10 grid gap-6 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-niebla">
              {t.pilares.items.map((p, i) => (
                <RevealItem as="li" key={i} className="sm:px-5 sm:first:pl-0 sm:last:pr-0">
                  <span className="grid size-11 place-items-center rounded-xl bg-puno text-white">
                    <Icon name={PILLAR_ICONS[i]} size={22} />
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
              media={media.equipoCampo}
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="aspect-4/5 rounded-[2rem] sm:w-[85%]"
            />
            <ImageReveal
              media={media.acopioColegio}
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
                  {t.gerencia.badge}
                  <br />
                  <span className="font-semibold text-pizarra">{t.gerencia.badgeSub}</span>
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
          className="absolute -top-40 -left-40 size-[34rem] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-brote)_18%,transparent),transparent_70%)]"
        />
        <div
          aria-hidden
          className="absolute -right-32 -bottom-48 size-[30rem] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-celeste)_22%,transparent),transparent_70%)]"
        />
        <div className="shell relative">
          <SectionHeading
            id="que-hacemos-titulo"
            tone="light"
            eyebrow={t.queHacemos.eyebrow}
            title={t.queHacemos.title}
            lede={t.queHacemos.lede}
          />
          <WorkLines
            lines={WORK_LINES}
            media={pickMedia(
              media,
              WORK_LINES.map((l) => l.image),
            )}
          />
        </div>
      </Section>

      {/* Servicios del portal */}
      <Section tone="white" aria-labelledby="servicios-titulo">
        <div className="shell">
          <SectionHeading id="servicios-titulo" eyebrow={t.servicios.eyebrow} title={t.servicios.title} lede={t.servicios.lede} />
          <PortalLinks />
        </div>
      </Section>

      {/* Cifras sobre el amanecer en los totorales */}
      <section aria-labelledby="cifras-titulo" className="relative isolate overflow-hidden bg-noche py-20 text-white md:py-28">
        <Image src={media.amanecerTotorales.src} alt="" fill sizes="100vw" quality={70} className="-z-20 object-cover" />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-noche)_35%,transparent)_0%,color-mix(in_srgb,var(--color-noche)_55%,transparent)_55%,color-mix(in_srgb,var(--color-noche)_92%,transparent)_100%)]"
        />
        <div className="shell">
          <SectionHeading id="cifras-titulo" tone="light" eyebrow={t.cifras.eyebrow} title={t.cifras.title} align="center" />
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
            eyebrow={t.organizacion.eyebrow}
            title={t.organizacion.title}
            lede={t.organizacion.lede}
          />
          <OrgChart />
        </div>
      </Section>

      {/* Notas de prensa: solo si hay */}
      {featured && (
        <Section tone="brand" aria-labelledby="noticias" className="overflow-hidden">
          <div aria-hidden className="lake-waves absolute inset-x-0 bottom-10 text-white/10" />
          <div
            aria-hidden
            className="absolute -top-40 -right-32 size-[34rem] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-celeste)_25%,transparent),transparent_70%)]"
          />
          <div className="shell relative">
            <SectionHeading
              id="noticias"
              tone="light"
              eyebrow={t.noticias.eyebrow}
              title={t.noticias.title}
              action={
                <ButtonLink href="/noticias" variant="white" icon="arrow">
                  {t.noticias.button}
                </ButtonLink>
              }
            />
            <FeaturedArticle article={featured} />
            <div className="mt-6">
              <ArticleList articles={more.slice(0, 3)} />
            </div>
          </div>
        </Section>
      )}

      {/* Últimas publicaciones de Facebook: solo si hay */}
      <FacebookTeaser />

      {/* Reporta */}
      <section aria-labelledby="reporta-titulo" className="bg-cielo py-16 md:py-20">
        <div className="shell">
          <Reveal className="relative isolate overflow-hidden rounded-3xl bg-puno px-6 py-10 text-white md:px-12 md:py-12">
            <div aria-hidden className="lake-waves absolute inset-x-0 bottom-6 -z-10 text-white/15" />
            <div
              aria-hidden
              className="absolute -top-24 -right-16 -z-10 size-72 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-brote)_45%,transparent),transparent_70%)]"
            />
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-5">
                <span className="hidden size-14 shrink-0 place-items-center rounded-2xl bg-white/15 sm:grid">
                  <Icon name="camera" size={28} />
                </span>
                <div>
                  <p className="text-sm font-bold tracking-[0.12em] text-celeste-200 uppercase">{t.reporta.eyebrow}</p>
                  <h2 id="reporta-titulo" className="mt-2 text-2xl font-extrabold md:text-3xl">
                    {t.reporta.title}
                  </h2>
                  <p className="mt-2 max-w-[60ch] text-white/85">{t.reporta.text}</p>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <ButtonLink href="/reporta" variant="white" icon="arrow">
                  {t.reporta.button}
                </ButtonLink>
                <ButtonLink href="/reporta/seguimiento" variant="ghost">
                  {t.reporta.secondary}
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
