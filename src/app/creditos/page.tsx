import type { Metadata } from "next";
import Image from "next/image";
import { CREDITED_MEDIA } from "@/shared/content/media";
import { PageHero } from "@/shared/ui/page-hero";
import { Section } from "@/shared/ui/section";

export const metadata: Metadata = {
  title: "Créditos fotográficos",
  robots: { index: false },
};

export default function CreditosPage() {
  return (
    <>
      <PageHero
        title="Créditos fotográficos"
        crumbs={[{ href: "/creditos", label: "Créditos" }]}
        lede="Fotografías de terceros usadas en este sitio, con su autor y licencia. Las demás fotografías son de la Municipalidad Provincial de Puno."
      />
      <Section tone="white">
        <ul className="shell divide-y divide-bruma">
          {CREDITED_MEDIA.map((m) => (
            <li key={m.src} className="grid grid-cols-[6rem_1fr] items-center gap-6 py-5 md:grid-cols-[8rem_1fr]">
              <span className="relative aspect-[4/3] overflow-hidden rounded-xl bg-bruma">
                <Image src={m.src} alt="" fill sizes="128px" className="object-cover" />
              </span>
              <span>
                <span className="block font-bold text-tinta">{m.alt}</span>
                <span className="text-sm text-pizarra">
                  {m.credit.author},{" "}
                  <a href={m.credit.url} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                    {m.credit.source}
                  </a>
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
