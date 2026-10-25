"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { formatNumber } from "@/shared/lib/format";

interface Props {
  value: number;
  className?: string;
  suffix?: string;
  duration?: number;
}

/** Cifra que cuenta hasta su valor al entrar en pantalla. El valor final está en el HTML desde el servidor. */
export function Counter({ value, className, suffix = "", duration = 1.8 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || !inView || reduced) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => (node.textContent = formatNumber(Math.round(v)) + suffix),
    });
    return () => controls.stop();
  }, [inView, reduced, value, suffix, duration]);

  return (
    <span ref={ref} className={className}>
      {formatNumber(value)}
      {suffix}
    </span>
  );
}
