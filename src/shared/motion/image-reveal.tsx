"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import type { Media } from "@/shared/content/media";
import { cn } from "@/shared/lib/cn";

interface Props {
  media: Pick<Media, "src" | "alt">;
  sizes: string;
  /** imagen sobre el pliegue (cabeceras): carga inmediata porque suele ser el LCP */
  eager?: boolean;
  className?: string;
  /** desplazamiento parallax en px dentro del marco */
  parallax?: number;
  from?: "bottom" | "left";
}

/** Imagen que se descubre con clip-path y se asienta (scale 1.15 → 1), con parallax suave. */
export function ImageReveal({ media, sizes, eager, className, parallax = 40, from = "bottom" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-parallax, parallax]);
  const hidden = from === "bottom" ? "inset(100% 0% 0% 0%)" : "inset(0% 100% 0% 0%)";

  return (
    <motion.div
      ref={ref}
      className={cn("relative overflow-hidden bg-bruma", className)}
      initial={{ clipPath: hidden }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{ duration: 1.3, ease: [0.76, 0, 0.24, 1] }}
    >
      <motion.div
        className="absolute inset-x-0 -inset-y-[60px]"
        style={{ y }}
        initial={{ scale: 1.15 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <Image src={media.src} alt={media.alt} sizes={sizes} loading={eager ? "eager" : undefined} fill className="object-cover" />
      </motion.div>
    </motion.div>
  );
}
