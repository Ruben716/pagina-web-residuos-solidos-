import Image from "next/image";
import Link from "next/link";
import { cn } from "@/shared/lib/cn";
import type { BrandData } from "./chrome";

/** Escudo + nombre de la institución y de la gerencia (los tres se cambian desde el panel). */
export function Brand({ brand, className, tone = "dark" }: { brand: BrandData; className?: string; tone?: "dark" | "light" }) {
  const light = tone === "light";
  return (
    <Link href="/" className={cn("group flex items-center gap-3", className)}>
      <Image
        src={brand.logo.src}
        alt=""
        width={brand.logo.width}
        height={brand.logo.height}
        loading="eager"
        className="h-12 w-auto transition-transform duration-700 ease-out-expo group-hover:scale-105"
      />
      <span className="flex flex-col leading-tight">
        <span className={cn("text-[1.02rem] font-extrabold tracking-[-0.01em]", light ? "text-white" : "text-puno-800")}>
          {brand.institution}
        </span>
        <span className={cn("max-w-[30ch] text-[0.74rem] font-semibold", light ? "text-white/80" : "text-puno")}>{brand.office}</span>
      </span>
    </Link>
  );
}
