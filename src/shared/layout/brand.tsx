import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/shared/config/site";
import { cn } from "@/shared/lib/cn";

/** Escudo oficial 2025 + nombre de la institución y de la gerencia. */
export function Brand({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  const light = tone === "light";
  return (
    <Link href="/" className={cn("group flex items-center gap-3", className)}>
      <Image
        src="/images/mpp/escudo-mpp.png"
        alt=""
        width={185}
        height={240}
        loading="eager"
        className="h-12 w-auto transition-transform duration-700 ease-out-expo group-hover:scale-105"
      />
      <span className="flex flex-col leading-tight">
        <span className={cn("text-[1.02rem] font-extrabold tracking-[-0.01em]", light ? "text-white" : "text-puno-800")}>
          {SITE.institution}
        </span>
        <span className={cn("max-w-[30ch] text-[0.74rem] font-semibold", light ? "text-white/80" : "text-puno")}>{SITE.office}</span>
      </span>
    </Link>
  );
}
