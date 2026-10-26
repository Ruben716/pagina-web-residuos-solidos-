import type { Metadata } from "next";
import Image from "next/image";
import { getPageCopy } from "@/modules/copy";
import { getSiteMedia } from "@/modules/media";
import type { Media } from "@/shared/content/media";
import { PageHero } from "@/shared/ui/page-hero";
import { Section } from "@/shared/ui/section";

export const metadata: Metadata = {
  title: "Créditos fotográficos",
  robots: { index: false },
};

/** Solo las imágenes vigentes que tienen autor: incluye las que se subieron desde el panel. */
export default async function CreditosPage() {
  const [t, media] = await Promise.all([getPageCopy("creditos"), getSiteMedia()]);
  const credited = Object.values(media).filter((m): m is Media & Required<Pick<Media, "credit">> => Boolean(m.credit));
  return (
    <>
      <PageHero title={t.hero.title} crumbs={[{ href: "/creditos", label: "Créditos" }]} lede={t.hero.lede} />
      <Section tone="white">
        <ul className="shell divide-y divide-bruma">
          {credited.map((m) => (
            <li key={m.src} className="grid grid-cols-[6rem_1fr] items-center gap-6 py-5 md:grid-cols-[8rem_1fr]">
              <span className="relative aspect-[4/3] overflow-hidden rounded-xl bg-bruma">
                <Image src={m.src} alt="" fill sizes="128px" className="object-cover" />
              </span>
              <span>
                <span className="block font-bold text-tinta">{m.alt}</span>
                <span className="text-sm text-pizarra">
                  {m.credit.author},{" "}
                  {m.credit.url ? (
                    <a href={m.credit.url} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                      {m.credit.source}
                    </a>
                  ) : (
                    m.credit.source
                  )}
                  . {m.credit.license}.
                </span>
              </span>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
