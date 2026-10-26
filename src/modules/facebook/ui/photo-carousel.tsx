"use client";

import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icon";
import type { FacebookPost } from "../types";
import { FbImage } from "./fb-image";

interface Props {
  post: FacebookPost;
  sizes: string;
  /** abre el visor en la foto que se está viendo */
  onExpand?: (photo: number) => void;
  /** en listas: flechas solo al pasar el cursor y puntos más chicos */
  compact?: boolean;
  /** foto completa, sin recortar (para afiches e infografías) */
  contain?: boolean;
  /** etiqueta en la esquina superior izquierda (tipo de publicación) */
  label?: ReactNode;
  className?: string;
}

/** Fotos de una publicación en carrusel: se pasan con flechas o deslizando el dedo. */
export function PhotoCarousel({ post, sizes, onExpand, compact, contain, label, className }: Props) {
  const { photos } = post;
  const total = photos.length;
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const photo = photos[index];

  const go = (delta: number) => {
    setDirection(delta);
    setIndex((i) => (i + delta + total) % total);
  };

  return (
    <div className={cn("group/car relative overflow-hidden rounded-xl bg-bruma", className)}>
      <Icon name="camera" size={28} aria-hidden className="absolute inset-0 m-auto text-niebla" />
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={photo.src}
          className="absolute inset-0 touch-pan-y"
          custom={direction}
          variants={{
            enter: (d: number) => ({ opacity: 0, x: d * 40 }),
            center: { opacity: 1, x: 0 },
            exit: (d: number) => ({ opacity: 0, x: d * -40 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          drag={total > 1 ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.x < -50) go(1);
            else if (info.offset.x > 50) go(-1);
          }}
        >
          <FbImage
            src={photo.src}
            alt=""
            fill
            draggable={false}
            sizes={sizes}
            className={cn("pointer-events-none", contain ? "object-contain" : "object-cover")}
          />
        </motion.div>
      </AnimatePresence>

      {post.video && (
        <span aria-hidden className="absolute inset-0 grid place-items-center">
          <span className="grid size-14 place-items-center rounded-full bg-white/90 text-puno-800">
            <Icon name="play" size={24} />
          </span>
        </span>
      )}

      {total > 1 && (
        <>
          {([-1, 1] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => go(d)}
              className={cn(
                "absolute top-1/2 grid -translate-y-1/2 place-items-center rounded-full bg-white/90 text-puno-800 transition hover:bg-white focus-visible:opacity-100",
                compact ? "size-9 opacity-0 group-hover/car:opacity-100 pointer-coarse:opacity-100" : "size-10",
                d < 0 ? "left-2.5" : "right-2.5",
              )}
            >
              <Icon name={d < 0 ? "chevronLeft" : "chevronRight"} size={compact ? 18 : 20} />
              <span className="sr-only">{d < 0 ? "Foto anterior" : "Foto siguiente"}</span>
            </button>
          ))}
          <span aria-hidden className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 gap-1.5">
            {photos.slice(0, 10).map((p, i) => (
              <span
                key={p.src}
                className={cn(
                  "rounded-full bg-white transition-all",
                  compact ? "h-1.5" : "h-2",
                  i === index ? "w-5" : "w-1.5 opacity-60 sm:w-2",
                )}
              />
            ))}
          </span>
          <span
            aria-live="polite"
            className="absolute right-2.5 bottom-2 rounded-full bg-noche/75 px-2 py-0.5 text-[0.7rem] font-bold text-white tabular-nums"
          >
            {index + 1} / {total}
          </span>
        </>
      )}

      {label && <span className="absolute top-2.5 left-2.5">{label}</span>}

      {onExpand && (
        <button
          type="button"
          onClick={() => onExpand(index)}
          className={cn(
            "absolute top-2.5 right-2.5 grid size-9 place-items-center rounded-full bg-white/90 text-puno-800 transition hover:bg-white focus-visible:opacity-100",
            compact && "opacity-0 group-hover/car:opacity-100 pointer-coarse:opacity-100",
          )}
        >
          <Icon name="expand" size={17} />
          <span className="sr-only">Ver las fotos en grande</span>
        </button>
      )}
    </div>
  );
}
