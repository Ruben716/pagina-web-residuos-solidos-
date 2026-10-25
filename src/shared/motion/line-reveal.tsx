"use client";

import { motion } from "motion/react";
import type { ElementType } from "react";
import { cn } from "@/shared/lib/cn";

interface Props {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  /** anima al montar (hero) o al entrar en viewport */
  trigger?: "mount" | "view";
}

/**
 * Titular que emerge palabra por palabra desde una máscara.
 * El texto completo queda en un span accesible; las palabras animadas son aria-hidden.
 */
export function LineReveal({ text, as: Tag = "h2", className, delay = 0, trigger = "view" }: Props) {
  const words = text.split(" ");
  const animate = trigger === "mount" ? { animate: "shown" } : { whileInView: "shown", viewport: { once: true, margin: "-10% 0px" } };

  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <motion.span aria-hidden initial="hidden" {...animate} transition={{ staggerChildren: 0.045, delayChildren: delay }}>
        {words.map((word, i) => (
          <span key={i} className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom">
            <motion.span
              className={cn("inline-block will-change-transform")}
              variants={{ hidden: { y: "110%" }, shown: { y: "0%" } }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              {word}
              {i < words.length - 1 ? " " : ""}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
