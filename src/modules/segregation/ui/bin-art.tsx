"use client";

import { motion } from "motion/react";
import { Icon, type IconName } from "@/shared/ui/icon";
import type { Bin, BinId } from "../data";

export const BIN_ICON: Record<BinId, IconName> = {
  aprovechable: "recycle",
  organico: "leaf",
  "no-aprovechable": "trash",
  peligroso: "alert",
};

/** Tacho ilustrado: cuerpo del color de la NTP, tapa con bisagra que se abre, etiqueta con ícono y ruedas. */
export function BinArt({ bin, open, className }: { bin: Bin; open: boolean; className?: string }) {
  const dark = `color-mix(in srgb, ${bin.swatch} 72%, black)`;
  return (
    <svg
      viewBox="0 0 120 176"
      className={className ?? "h-auto w-full drop-shadow-[0_14px_18px_color-mix(in_srgb,var(--color-noche)_22%,transparent)]"}
      aria-hidden
    >
      {/* tapa con bisagra a la izquierda */}
      <motion.g
        initial={false}
        animate={{ rotate: open ? -32 : 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 14 }}
        style={{ originX: 0.04, originY: 1 }}
      >
        <rect x="44" y="18" width="32" height="12" rx="5" style={{ fill: dark }} />
        <rect x="6" y="28" width="108" height="18" rx="7" style={{ fill: dark }} />
      </motion.g>
      {/* cuerpo */}
      <path d="M13 48H107L99 160Q98.5 166 92 166H28Q21.5 166 21 160Z" style={{ fill: bin.swatch }} />
      <path d="M13 48H107L106.4 56H13.6Z" fill="rgb(0 0 0 / 0.18)" />
      {[38, 60, 82].map((x) => (
        <path key={x} d={`M${x} 64V150`} stroke="rgb(255 255 255 / 0.14)" strokeWidth="4" strokeLinecap="round" />
      ))}
      {/* etiqueta */}
      <rect x="32" y="84" width="56" height="48" rx="10" fill="rgb(255 255 255 / 0.92)" />
      <Icon name={BIN_ICON[bin.id]} size={28} x={46} y={94} style={{ color: bin.swatch }} />
      {/* ruedas */}
      <circle cx="32" cy="168" r="7" fill="#1f2937" />
      <circle cx="88" cy="168" r="7" fill="#1f2937" />
    </svg>
  );
}
