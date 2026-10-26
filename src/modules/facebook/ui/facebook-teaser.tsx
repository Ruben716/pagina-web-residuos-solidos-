import Link from "next/link";
import { formatDate } from "@/shared/lib/format";
import { RevealGroup, RevealItem } from "@/shared/motion/reveal";
import { ButtonLink } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import { Section, SectionHeading } from "@/shared/ui/section";
import { getFacebookFeed } from "../server";
import { FbImage } from "./fb-image";
import { titleOf } from "./post-text";

/** Las tres últimas publicaciones de Facebook en la portada. Si no hay ninguna, no se muestra. */
export async function FacebookTeaser() {
  const { posts } = await getFacebookFeed();
  if (!posts.length) return null;

  return (
    <Section tone="white" aria-labelledby="facebook-titulo">
      <div className="shell">
        <SectionHeading
          id="facebook-titulo"
          eyebrow="Desde nuestra página de Facebook"
          title="Lo último que publicamos"
          action={
            <ButtonLink href="/actualidad" variant="outline" icon="arrow">
              Ver toda la actualidad
            </ButtonLink>
          }
        />
        <RevealGroup as="ul" className="grid gap-10 md:grid-cols-3 md:gap-8">
          {posts.slice(0, 3).map((p) => (
            <RevealItem as="li" key={p.id}>
              <Link href={`/actualidad#publicacion-${p.id}`} className="group block">
                <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-cielo">
                  <Icon name={p.photos.length ? "camera" : "info"} size={36} aria-hidden className="absolute inset-0 m-auto text-niebla" />
                  {p.photos[0] && (
                    <FbImage
                      src={p.photos[0].src}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 30vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                    />
                  )}
                  {p.photos.length > 1 && (
                    <span className="absolute top-2.5 left-2.5 rounded-full bg-noche/75 px-2.5 py-0.5 text-xs font-bold text-white">
                      {p.photos.length} fotos
                    </span>
                  )}
                </div>
                <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-pizarra">
                  <Icon name="facebook" size={15} className="text-puno" />
                  <time dateTime={p.date}>{formatDate(p.date)}</time>
                </p>
                <h3 className="mt-2 line-clamp-3 text-lg leading-snug font-extrabold text-puno-800 transition-colors group-hover:text-puno">
                  {titleOf(p)}
                </h3>
                {p.headline && p.body && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-pizarra">{p.body}</p>}
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </Section>
  );
}
