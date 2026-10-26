"use client";

import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icon";

const BTN = {
  light: "border-bruma text-puno hover:border-puno hover:bg-puno hover:text-white",
  dark: "border-white/30 text-white hover:border-white hover:bg-white hover:text-puno-800",
};

/** Compartir una publicación: Facebook, WhatsApp (lo más usado en Puno) y copiar el enlace. */
export function ShareLinks({ url, title, tone = "light" }: { url: string; title: string; tone?: "light" | "dark" }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copia el enlace:", url);
    }
  };
  const btn = cn("grid size-10 place-items-center rounded-full border transition-colors", BTN[tone]);

  return (
    <div className="flex items-center gap-2">
      <span className={cn("mr-1 text-sm font-semibold", tone === "dark" ? "text-white/80" : "text-pizarra")}>Compartir:</span>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" className={btn}>
        <Icon name="facebook" size={17} />
        <span className="sr-only">en Facebook (se abre en otra pestaña)</span>
      </a>
      <a href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`} target="_blank" rel="noreferrer" className={btn}>
        <Icon name="whatsapp" size={18} />
        <span className="sr-only">por WhatsApp (se abre en otra pestaña)</span>
      </a>
      <button type="button" onClick={copy} className={btn}>
        <Icon name={copied ? "check" : "link"} size={17} />
        <span className="sr-only">{copied ? "Enlace copiado" : "Copiar enlace"}</span>
      </button>
      <span aria-live="polite" className={cn("text-xs font-bold", tone === "dark" ? "text-brote" : "text-puno")}>
        {copied ? "¡Copiado!" : ""}
      </span>
    </div>
  );
}
