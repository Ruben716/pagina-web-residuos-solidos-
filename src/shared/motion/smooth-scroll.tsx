"use client";

import { ReactLenis } from "lenis/react";
import { MotionConfig, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Lenis + MotionConfig. Con "reducir movimiento" el scroll vuelve a ser nativo. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <MotionConfig reducedMotion="user" transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.9 }}>
      {reduced ? (
        children
      ) : (
        <ReactLenis root options={{ lerp: 0.11, wheelMultiplier: 0.9 }}>
          {children}
        </ReactLenis>
      )}
    </MotionConfig>
  );
}
