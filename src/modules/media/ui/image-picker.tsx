"use client";

import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icon";
import { Modal, Thumb } from "./parts";
import { UploadForm } from "./upload-form";

import type { ImageChoice } from "../domain/refs";

type Tab = "biblioteca" | "sitio" | "subir";

/**
 * Campo de imagen para el contenido: muestra la elegida y abre una ventana para cambiarla
 * (biblioteca, fotos del sitio o subir una nueva en el momento).
 */
export function ImagePicker({
  id,
  value,
  choices,
  onChange,
  invalid,
}: {
  id: string;
  value: string;
  choices: readonly ImageChoice[];
  onChange: (ref: string) => void;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("biblioteca");
  const current = choices.find((c) => c.ref === value);
  const pick = (ref: string) => {
    onChange(ref);
    setOpen(false);
  };

  return (
    <div className={cn("flex items-center gap-4 rounded-xl border bg-white p-2", invalid ? "border-peligroso" : "border-niebla")}>
      {current ? (
        <Thumb src={current.src} className="h-16 w-24 shrink-0" sizes="96px" />
      ) : (
        <span className="grid h-16 w-24 shrink-0 place-items-center rounded-xl bg-cielo text-pizarra">
          <Icon name="camera" size={22} />
        </span>
      )}
      <span className="min-w-0 flex-1 text-sm">
        <span className="line-clamp-2 text-tinta">{current?.alt ?? (value ? "Imagen nueva (aparece al recargar)" : "Sin imagen")}</span>
        {current && <span className="text-xs text-pizarra">{current.from === "biblioteca" ? "De la biblioteca" : "Foto del sitio"}</span>}
      </span>
      <button
        id={id}
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl border border-puno/40 px-3 text-sm font-bold text-puno hover:bg-celeste-50"
      >
        <Icon name="camera" size={16} />
        {value ? "Cambiar" : "Elegir"}
      </button>

      {open && (
        <Modal title="Elegir imagen" onClose={() => setOpen(false)}>
          <div role="tablist" aria-label="Origen de la imagen" className="flex gap-1 rounded-xl bg-cielo p-1">
            {(
              [
                ["biblioteca", "Biblioteca"],
                ["sitio", "Fotos del sitio"],
                ["subir", "Subir nueva"],
              ] as const
            ).map(([t, label]) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={cn(
                  "flex-1 rounded-lg px-3 py-2 text-sm font-bold",
                  tab === t ? "bg-white text-puno-800 shadow-sm" : "text-pizarra",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div role="tabpanel" className="mt-5">
            {tab === "subir" ? (
              <UploadForm onUploaded={(assetId) => pick(`asset:${assetId}`)} />
            ) : (
              <ChoiceGrid
                choices={choices.filter((c) => c.from === tab)}
                selected={value}
                onPick={pick}
                empty={tab === "biblioteca" ? "La biblioteca está vacía: sube una imagen." : "No hay fotos."}
              />
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

function ChoiceGrid({
  choices,
  selected,
  onPick,
  empty,
}: {
  choices: readonly ImageChoice[];
  selected: string;
  onPick: (ref: string) => void;
  empty: string;
}) {
  if (!choices.length) return <p className="text-pizarra">{empty}</p>;
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {choices.map((c) => (
        <li key={c.ref}>
          <button type="button" onClick={() => onPick(c.ref)} aria-pressed={c.ref === selected} className="group block w-full text-left">
            <Thumb
              src={c.src}
              className={cn(
                "aspect-4/3 ring-puno transition group-hover:ring-4 group-focus-visible:ring-4",
                c.ref === selected && "ring-4",
              )}
            />
            <span className="mt-1.5 line-clamp-2 block text-xs text-pizarra">{c.alt}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
