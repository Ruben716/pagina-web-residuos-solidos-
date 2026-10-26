"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { formatDate } from "@/shared/lib/format";
import { ButtonLink } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import type { FacebookPost } from "../types";
import { FbImage } from "./fb-image";
import { kindOf, labelOf } from "./post-text";
import { RichText } from "./rich-text";

interface Props {
  posts: readonly FacebookPost[];
  index: number;
  photo: number;
  onNavigate: (index: number) => void;
  onClose: () => void;
}

/**
 * Publicación completa en un diálogo nativo. Foto grande con miniaturas debajo; se pasa con flechas,
 * teclado o deslizando el dedo. Abajo del texto, saltos a la publicación más reciente o más antigua.
 * Esc o un clic en el fondo lo cierran.
 */
export function PostViewer({ posts, index, photo, onNavigate, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const post = posts[index];

  useEffect(() => {
    ref.current?.showModal();
    const root = document.documentElement;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = "";
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      // el clic en el fondo oscuro llega al propio <dialog>; dentro, al contenido
      onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
      // Lenis no debe mover la página detrás del diálogo
      data-lenis-prevent
      className="m-auto w-[min(76rem,calc(100%-1rem))] max-w-none overflow-hidden rounded-3xl bg-white p-0 shadow-float backdrop:bg-noche/85 backdrop:backdrop-blur-sm sm:w-[min(76rem,calc(100%-2rem))]"
    >
      <ViewerBody
        key={post.id}
        post={post}
        start={photo}
        titleId={titleId}
        newer={index > 0 ? () => onNavigate(index - 1) : undefined}
        older={index < posts.length - 1 ? () => onNavigate(index + 1) : undefined}
      />
      <button
        type="button"
        onClick={() => ref.current?.close()}
        className="absolute top-3 right-3 z-10 grid size-11 place-items-center rounded-full bg-white text-puno-800 shadow-float transition-colors hover:bg-celeste-50"
      >
        <Icon name="close" size={22} />
        <span className="sr-only">Cerrar</span>
      </button>
    </dialog>
  );
}

interface BodyProps {
  post: FacebookPost;
  start: number;
  titleId: string;
  newer?: () => void;
  older?: () => void;
}

function ViewerBody({ post, start, titleId, newer, older }: BodyProps) {
  const [current, setCurrent] = useState(start);
  const [direction, setDirection] = useState(1);
  const thumbs = useRef<HTMLDivElement>(null);
  const total = post.photos.length;
  const photo = post.photos[current];

  const go = (next: number) => {
    setDirection(next > current ? 1 : -1);
    setCurrent((next + total) % total);
  };

  // las flechas del teclado pasan las fotos
  useEffect(() => {
    if (total < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      setDirection(e.key === "ArrowRight" ? 1 : -1);
      setCurrent((i) => (i + (e.key === "ArrowRight" ? 1 : -1) + total) % total);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  // la miniatura activa siempre a la vista
  // (se desplaza solo la fila; scrollIntoView también movía el diálogo de costado)
  useEffect(() => {
    const row = thumbs.current;
    const thumb = row?.querySelector<HTMLElement>("[aria-current=true]");
    if (row && thumb) row.scrollTo({ left: thumb.offsetLeft - (row.clientWidth - thumb.clientWidth) / 2, behavior: "smooth" });
  }, [current]);

  return (
    <div className="grid max-h-[calc(100dvh-1rem)] grid-cols-[minmax(0,1fr)] overflow-x-hidden overflow-y-auto sm:max-h-[calc(100dvh-2rem)] lg:h-[min(88dvh,48rem)] lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:overflow-hidden">
      {photo && (
        <div className="flex min-h-0 flex-col bg-noche">
          <div className="relative aspect-4/3 overflow-hidden lg:aspect-auto lg:flex-1">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={photo.src}
                className="absolute inset-0 touch-pan-y"
                custom={direction}
                variants={{
                  enter: (d: number) => ({ opacity: 0, x: d * 60 }),
                  center: { opacity: 1, x: 0 },
                  exit: (d: number) => ({ opacity: 0, x: d * -60 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                drag={total > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60) go(current + 1);
                  else if (info.offset.x > 60) go(current - 1);
                }}
              >
                <FbImage
                  src={photo.src}
                  alt={total > 1 ? `Foto ${current + 1} de ${total}: ${labelOf(post)}` : `Foto: ${labelOf(post)}`}
                  fill
                  draggable={false}
                  sizes="(min-width: 1024px) 62vw, 100vw"
                  className="pointer-events-none object-contain"
                />
              </motion.div>
            </AnimatePresence>

            {post.video && (
              <a
                href={post.link}
                target="_blank"
                rel="noreferrer"
                className="absolute inset-0 grid place-items-center bg-noche/30 transition-colors hover:bg-noche/10"
              >
                <span className="flex items-center gap-2 rounded-full bg-white px-5 py-3 font-bold text-puno-800 shadow-float">
                  <Icon name="play" size={20} />
                  Ver el video en Facebook
                  <span className="sr-only"> (se abre en otra pestaña)</span>
                </span>
              </a>
            )}

            {total > 1 && (
              <>
                {([-1, 1] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => go(current + d)}
                    className={cn(
                      "absolute top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-puno-800 shadow-float transition-colors hover:bg-white",
                      d < 0 ? "left-3" : "right-3",
                    )}
                  >
                    <Icon name={d < 0 ? "chevronLeft" : "chevronRight"} size={22} />
                    <span className="sr-only">{d < 0 ? "Foto anterior" : "Foto siguiente"}</span>
                  </button>
                ))}
                <p
                  aria-live="polite"
                  className="absolute top-4 left-4 rounded-full bg-noche/80 px-3 py-1 text-xs font-bold text-white tabular-nums"
                >
                  {current + 1} / {total}
                </p>
              </>
            )}
          </div>

          {total > 1 && (
            <div ref={thumbs} className="relative flex scrollbar-thin gap-2 overflow-x-auto p-3">
              {post.photos.map((p, i) => (
                <button
                  key={p.src}
                  type="button"
                  aria-current={i === current}
                  onClick={() => go(i)}
                  className={cn(
                    "relative size-16 shrink-0 overflow-hidden rounded-lg ring-2 ring-offset-2 ring-offset-noche transition md:size-[4.5rem]",
                    i === current ? "ring-brote" : "opacity-60 ring-transparent hover:opacity-100",
                  )}
                >
                  <FbImage src={p.src} alt="" fill sizes="72px" className="object-cover" />
                  <span className="sr-only">Ver foto {i + 1}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={cn("flex min-h-0 flex-col", !photo && "lg:col-span-2")}>
        <div className="flex-1 p-6 md:p-8 lg:overflow-y-auto">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 pr-12 text-sm font-semibold text-pizarra">
            <span className="rounded-full bg-celeste-50 px-2.5 py-0.5 text-xs font-extrabold text-puno-800">{kindOf(post)}</span>
            <time dateTime={post.date}>{formatDate(post.date, { dateStyle: "long", timeStyle: "short" })}</time>
          </p>
          <h2 id={titleId} className="mt-3 text-2xl leading-tight font-extrabold text-puno-800 md:text-[1.7rem]">
            {labelOf(post)}
          </h2>
          {post.body && <RichText text={post.body} className="mt-4 leading-relaxed whitespace-pre-line text-tinta" />}
          <ButtonLink href={post.link} target="_blank" rel="noreferrer" variant="outline" icon="external" className="mt-6">
            Ver en Facebook
            <span className="sr-only"> (se abre en otra pestaña)</span>
          </ButtonLink>
        </div>

        {(newer || older) && (
          <nav aria-label="Otras publicaciones" className="grid grid-cols-2 border-t border-bruma">
            <button
              type="button"
              onClick={newer}
              disabled={!newer}
              className="flex min-h-14 items-center gap-2 px-5 text-sm font-bold text-puno transition-colors hover:bg-cielo disabled:invisible"
            >
              <Icon name="chevronLeft" size={18} />
              Más reciente
            </button>
            <button
              type="button"
              onClick={older}
              disabled={!older}
              className="flex min-h-14 items-center justify-end gap-2 border-l border-bruma px-5 text-sm font-bold text-puno transition-colors hover:bg-cielo disabled:invisible"
            >
              Más antigua
              <Icon name="chevronRight" size={18} />
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
