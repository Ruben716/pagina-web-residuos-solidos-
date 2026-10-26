"use client";

import Image from "next/image";
import { type ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icon";

/**
 * Ventana modal nativa: Esc o clic en el fondo la cierran. Se dibuja al final del <body>: así un formulario
 * dentro de la ventana nunca queda anidado en el formulario de la página (HTML inválido).
 */
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => ref.current?.showModal(), []);
  return createPortal(
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
      className="m-auto w-[min(48rem,calc(100%-1rem))] max-w-none rounded-3xl bg-white p-0 shadow-float backdrop:bg-noche/70"
    >
      <div className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-6 md:p-8">
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="text-xl font-extrabold text-puno-800">{title}</h2>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-cielo"
          >
            <Icon name="close" size={20} />
            <span className="sr-only">Cerrar</span>
          </button>
        </div>
        {children}
      </div>
    </dialog>,
    document.body,
  );
}

export function Thumb({ src, className, sizes = "160px" }: { src: string; className?: string; sizes?: string }) {
  return (
    <span className={cn("relative block overflow-hidden rounded-xl bg-bruma", className)}>
      <Image src={src} alt="" fill sizes={sizes} className="object-cover" />
    </span>
  );
}
