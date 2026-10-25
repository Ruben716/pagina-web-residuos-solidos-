import type { ComponentProps, ReactNode } from "react";
import { Reveal } from "@/shared/motion/reveal";
import { cn } from "@/shared/lib/cn";

type Tone = "white" | "soft" | "tint" | "brand";

const TONES: Record<Tone, string> = {
  white: "bg-white text-tinta",
  soft: "bg-cielo text-tinta",
  /** celeste con degradado hacia el blanco: separa bloques sin llegar al verde de marca */
  tint: "bg-[linear-gradient(180deg,#d9f0f5_0%,#eef8fa_55%,#f8fcfc_100%)] text-tinta",
  brand: "bg-puno-800 text-white",
};

interface SectionProps extends ComponentProps<"section"> {
  tone?: Tone;
}

export function Section({ tone = "white", className, children, ...props }: SectionProps) {
  return (
    <section data-tone={tone} className={cn("relative py-16 md:py-24", TONES[tone], className)} {...props}>
      {children}
    </section>
  );
}

interface HeadingProps {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  id?: string;
  align?: "left" | "center";
  /** enlace o botón a la derecha del titular (sólo alineado a la izquierda) */
  action?: ReactNode;
  tone?: "dark" | "light";
  className?: string;
}

/** Titular de sección del portal: rótulo en mayúsculas, título en verde de marca y bajada breve. */
export function SectionHeading({ eyebrow, title, lede, id, align = "left", action, tone = "dark", className }: HeadingProps) {
  const light = tone === "light";
  return (
    <Reveal
      className={cn(
        "mb-10 md:mb-14",
        align === "center" ? "mx-auto max-w-3xl text-center" : action && "flex flex-wrap items-end justify-between gap-6",
        className,
      )}
    >
      <div className={cn(align === "left" && "max-w-3xl")}>
        {eyebrow && <p className={cn("eyebrow", light && "text-celeste-200", align === "center" && "justify-center")}>{eyebrow}</p>}
        <h2
          id={id}
          className={cn("mt-3 text-[clamp(1.75rem,3.4vw,2.6rem)] leading-[1.12] font-extrabold", light ? "text-white" : "text-puno-800")}
        >
          {title}
        </h2>
        {lede && <p className={cn("mt-4 text-lg leading-relaxed", light ? "text-white/80" : "text-pizarra")}>{lede}</p>}
      </div>
      {action && align === "left" && <div className="shrink-0">{action}</div>}
    </Reveal>
  );
}
