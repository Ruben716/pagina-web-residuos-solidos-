import type { Metadata } from "next";
import { getPageCopy, getPageMetadata } from "@/modules/copy";
import { type Faq, getFaqs } from "@/modules/faq";
import { Reveal } from "@/shared/motion/reveal";
import { Accordion } from "@/shared/ui/accordion";
import { Icon, type IconName } from "@/shared/ui/icon";
import { PageHero } from "@/shared/ui/page-hero";
import { Section } from "@/shared/ui/section";
import { getIdentity, telHref } from "@/modules/identity";
import { getSiteMedia } from "@/modules/media";

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("preguntas");
}

const TOPICS: readonly { topic: Faq["topic"]; icon: IconName }[] = [
  { topic: "Recolección", icon: "truck" },
  { topic: "Segregación", icon: "recycle" },
  { topic: "Compostaje", icon: "sprout" },
  { topic: "Reportes", icon: "camera" },
];

export default async function PreguntasPage() {
  const [t, media, { contact }, faqs] = await Promise.all([getPageCopy("preguntas"), getSiteMedia(), getIdentity(), getFaqs()]);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHero
        eyebrow={t.hero.eyebrow}
        title={t.hero.title}
        crumbs={[{ href: "/preguntas", label: "Preguntas frecuentes" }]}
        lede={t.hero.lede}
        image={media.plaza}
        focus="50% 45%"
      />
      <Section tone="soft">
        <div className="shell grid gap-10 lg:grid-cols-12">
          <nav aria-label="Temas" className="lg:col-span-3">
            <ul className="space-y-1 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
              {TOPICS.map(({ topic, icon }) => (
                <li key={topic}>
                  <a
                    href={`#t-${topic}`}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-bold text-puno-800 transition-colors hover:bg-white"
                  >
                    <Icon name={icon} size={20} className="text-puno" />
                    {topic}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-12 lg:col-span-9">
            {TOPICS.map(({ topic, icon }) => (
              <Reveal key={topic}>
                <section aria-labelledby={`t-${topic}`} className="scroll-mt-28">
                  <h2 id={`t-${topic}`} className="mb-4 flex items-center gap-3 text-2xl font-extrabold text-puno-800">
                    <span className="grid size-10 place-items-center rounded-xl bg-white text-puno ring-1 ring-bruma">
                      <Icon name={icon} size={20} />
                    </span>
                    {topic}
                  </h2>
                  <Accordion
                    name={`faq-${topic}`}
                    items={faqs.filter((f) => f.topic === topic).map((f) => ({ id: f.id, question: f.question, answer: f.answer }))}
                  />
                </section>
              </Reveal>
            ))}
            <div className="flex flex-col gap-3 rounded-2xl bg-puno-800 p-6 text-white md:flex-row md:items-center md:justify-between">
              <p className="text-lg font-bold">{t.ayuda.title}</p>
              <p className="flex flex-wrap gap-x-5 gap-y-2 text-white/90">
                <a href={telHref(contact.phone)} className="inline-flex items-center gap-2 font-bold hover:underline">
                  <Icon name="phone" size={18} />
                  Central {contact.phone}
                </a>
                <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2 font-bold break-all hover:underline">
                  <Icon name="mail" size={18} />
                  {contact.email}
                </a>
              </p>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
