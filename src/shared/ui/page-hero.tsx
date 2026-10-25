import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Media } from "@/shared/content/media";
import { cn } from "@/shared/lib/cn";
import { FadeIn } from "@/shared/motion/fade-in";
import { LineReveal } from "@/shared/motion/line-reveal";
import { Icon } from "./icon";

interface Crumb {
  href: string;
  label: string;
}

interface Props {
  title: string;
  eyebrow?: string;
  lede?: ReactNode;
  crumbs?: readonly Crumb[];
  image?: Pick<Media, "src" | "alt">;
  /** posición del encuadre de la foto (object-position) */
  focus?: string;
  children?: ReactNode;
  className?: string;
}

/** Cabecera de páginas internas: foto institucional con velo verde, migas de pan y titular. */
export function PageHero({ title, eyebrow, lede, crumbs = [], image, focus = "center", children, className }: Props) {
  return (
    <section className={cn("relative isolate overflow-hidden bg-puno-800 text-white", className)}>
      {image && (
        <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
          <Image
            src={image.src}
            alt=""
            fill
            loading="eager"
            fetchPriority="high"
            sizes="100vw"
            className="animate-ken-burns object-cover"
            style={{ objectPosition: focus }}
          />
        </div>
      )}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(8_48_31/0.92)_0%,rgb(13_74_51/0.78)_45%,rgb(13_74_51/0.3)_100%)]"
      />
      <div className="shell py-12 md:py-20">
        <nav aria-label="Ruta de navegación" className="text-sm text-white/80">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="inline-flex items-center gap-1.5 hover:text-white hover:underline">
                <Icon name="home" size={15} />
                Inicio
              </Link>
            </li>
            {crumbs.map((c, i) => (
              <li key={c.href} className="flex items-center gap-1.5">
                <Icon name="chevronRight" size={14} className="opacity-60" />
                {i === crumbs.length - 1 ? (
                  <span aria-current="page" className="font-semibold text-white">
                    {c.label}
                  </span>
                ) : (
                  <Link href={c.href} className="hover:text-white hover:underline">
                    {c.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <div className="mt-8 max-w-3xl md:mt-12">
          {eyebrow && (
            <FadeIn>
              <p className="eyebrow text-celeste-200">{eyebrow}</p>
            </FadeIn>
          )}
          <LineReveal
            as="h1"
            trigger="mount"
            text={title}
            className="mt-3 text-[clamp(2.1rem,5vw,3.6rem)] leading-[1.06] font-extrabold tracking-[-0.02em]"
          />
          {lede && (
            <FadeIn delay={0.25}>
              <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-white/85">{lede}</p>
            </FadeIn>
          )}
          {children && (
            <FadeIn delay={0.4} className="mt-8 flex flex-wrap items-center gap-3">
              {children}
            </FadeIn>
          )}
        </div>
      </div>
    </section>
  );
}
