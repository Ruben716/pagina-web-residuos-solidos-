"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Línea fina de avance de lectura en el borde superior: reemplaza a la barra de scroll oculta. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[80] h-[3px] origin-left bg-linear-to-r from-puno-500 via-celeste to-inti"
      style={{ scaleX }}
    />
  );
}
