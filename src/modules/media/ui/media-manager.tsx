"use client";

import { useActionState, useState } from "react";
import type { Media, MediaKey } from "@/shared/content/media";
import { cn } from "@/shared/lib/cn";
import { formatDate, formatNumber } from "@/shared/lib/format";
import { FormAlert, SubmitButton } from "@/shared/ui/form-feedback";
import { Icon } from "@/shared/ui/icon";
import { SLOT_GROUPS, SLOTS } from "../domain/slots";
import { assignSlot, deleteMedia, editMediaMeta, type MediaFormState, resetSlot } from "../server/actions";
import { Modal, Thumb } from "./parts";
import { MetaFields, UploadForm } from "./upload-form";

export interface SlotView {
  key: MediaKey;
  current: Pick<Media, "src" | "alt">;
  /** true si el panel la reemplazó (si no, es la imagen de fábrica) */
  custom: boolean;
}

export interface AssetView {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  bytes: number;
  originalName: string;
  createdAt: Date;
  createdBy: string | null;
  usedIn: MediaKey[];
  creditAuthor: string | null;
  creditSource: string | null;
  creditUrl: string | null;
  creditLicense: string | null;
}

const idle = { status: "idle" } as MediaFormState;

// ---------- cambiar la imagen de un espacio ----------

function SlotDialog({ slot, assets, onClose }: { slot: SlotView; assets: readonly AssetView[]; onClose: () => void }) {
  const [tab, setTab] = useState<"subir" | "biblioteca">(assets.length ? "biblioteca" : "subir");
  const [state, action] = useActionState(async (prev: MediaFormState, data: FormData) => {
    const result = await assignSlot(prev, data);
    if (result.status === "success") onClose();
    return result;
  }, idle);
  const info = SLOTS[slot.key];

  return (
    <Modal title={`Cambiar: ${info.label}`} onClose={onClose}>
      <p className="text-sm text-pizarra">
        Aparece en: <strong className="text-tinta">{info.where}</strong>
        {info.shape === "logo" ? ". Usa un PNG o WebP con fondo transparente." : `. Mejor una foto ${info.shape}.`}
      </p>
      <div role="tablist" aria-label="Origen de la imagen" className="mt-5 flex gap-1 rounded-xl bg-cielo p-1">
        {(["biblioteca", "subir"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn("flex-1 rounded-lg px-4 py-2 text-sm font-bold", tab === t ? "bg-white text-puno-800 shadow-sm" : "text-pizarra")}
          >
            {t === "subir" ? "Subir una nueva" : `Elegir de la biblioteca (${assets.length})`}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="mt-5">
        {tab === "subir" ? (
          <UploadForm slot={slot.key} onDone={onClose} />
        ) : assets.length ? (
          <form action={action}>
            <input type="hidden" name="slot" value={slot.key} />
            <FormAlert state={state} />
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {assets.map((a) => (
                <li key={a.id}>
                  <button type="submit" name="assetId" value={a.id} className="group block w-full text-left">
                    <Thumb src={a.src} className="aspect-4/3 ring-puno transition group-hover:ring-4 group-focus-visible:ring-4" />
                    <span className="mt-1.5 line-clamp-2 block text-xs text-pizarra">{a.alt}</span>
                    <span className="sr-only">Usar esta imagen</span>
                  </button>
                </li>
              ))}
            </ul>
          </form>
        ) : (
          <p className="text-pizarra">La biblioteca está vacía: sube una imagen nueva.</p>
        )}
      </div>
    </Modal>
  );
}

function ResetButton({ slot }: { slot: MediaKey }) {
  const [state, action] = useActionState(resetSlot, idle);
  return (
    <form action={action}>
      <input type="hidden" name="slot" value={slot} />
      <SubmitButton variant="outline" className="min-h-10 px-3 text-sm" pendingLabel="…">
        Restaurar original
      </SubmitButton>
      <FormAlert state={state} />
    </form>
  );
}

function SlotBoard({ slots, assets }: { slots: readonly SlotView[]; assets: readonly AssetView[] }) {
  const [editing, setEditing] = useState<SlotView | null>(null);
  return (
    <div className="space-y-10">
      {SLOT_GROUPS.map((group) => (
        <section key={group} aria-labelledby={`grupo-${group}`}>
          <h3 id={`grupo-${group}`} className="text-sm font-extrabold tracking-[0.12em] text-pizarra uppercase">
            {group}
          </h3>
          <ul className="mt-3 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {slots
              .filter((s) => SLOTS[s.key].group === group)
              .map((s) => {
                const info = SLOTS[s.key];
                return (
                  <li
                    id={`espacio-${s.key}`}
                    key={s.key}
                    className="flex scroll-mt-6 gap-4 rounded-2xl bg-white p-3 ring-1 ring-bruma target:ring-2 target:ring-puno"
                  >
                    <Thumb
                      src={s.current.src}
                      className={cn("shrink-0", info.shape === "logo" ? "size-24 bg-white [&_img]:object-contain" : "h-24 w-32")}
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="flex flex-wrap items-center gap-2 font-bold text-tinta">
                        {info.label}
                        {s.custom && (
                          <span className="rounded-full bg-brote/40 px-2 py-0.5 text-xs font-extrabold text-puno-800">Cambiada</span>
                        )}
                      </p>
                      <p className="line-clamp-2 text-xs text-pizarra">{info.where}</p>
                      <div className="mt-auto flex flex-wrap gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditing(s)}
                          className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-puno px-3 text-sm font-bold text-white hover:bg-puno-800"
                        >
                          <Icon name="camera" size={16} />
                          Cambiar
                        </button>
                        {s.custom && <ResetButton slot={s.key} />}
                      </div>
                    </div>
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
      {editing && <SlotDialog slot={editing} assets={assets} onClose={() => setEditing(null)} />}
    </div>
  );
}

// ---------- biblioteca ----------

function AssetDialog({ asset, onClose }: { asset: AssetView; onClose: () => void }) {
  const [state, edit] = useActionState(editMediaMeta, idle);
  const [deleted, remove] = useActionState(async (prev: MediaFormState, data: FormData) => {
    const result = await deleteMedia(prev, data);
    if (result.status === "success") onClose();
    return result;
  }, idle);
  const errors = state.status === "error" ? state.errors : undefined;
  return (
    <Modal title="Detalle de la imagen" onClose={onClose}>
      <div className="grid gap-6 md:grid-cols-[14rem_1fr]">
        <div>
          <Thumb src={asset.src} sizes="224px" className="aspect-4/3" />
          <dl className="mt-3 space-y-1 text-xs text-pizarra">
            <div>
              <dt className="inline font-bold">Archivo: </dt>
              <dd className="inline break-all">{asset.originalName}</dd>
            </div>
            <div>
              <dt className="inline font-bold">Tamaño: </dt>
              <dd className="inline">
                {asset.width}×{asset.height} px · {formatNumber(asset.bytes / 1024, { maximumFractionDigits: 0 })} KB
              </dd>
            </div>
            <div>
              <dt className="inline font-bold">Subida: </dt>
              <dd className="inline">
                {formatDate(asset.createdAt.toISOString(), { dateStyle: "medium" })}
                {asset.createdBy && ` por ${asset.createdBy}`}
              </dd>
            </div>
            <div>
              <dt className="inline font-bold">En uso: </dt>
              <dd className="inline">{asset.usedIn.length ? asset.usedIn.map((k) => SLOTS[k].label).join(", ") : "no"}</dd>
            </div>
          </dl>
        </div>
        <div className="space-y-6">
          <form action={edit} className="space-y-4" noValidate>
            <input type="hidden" name="id" value={asset.id} />
            <FormAlert state={state} success={state.status === "success" && state.data.message} />
            <MetaFields
              prefix={`edit-${asset.id}`}
              errors={errors}
              defaults={{
                alt: asset.alt,
                creditAuthor: asset.creditAuthor,
                creditSource: asset.creditSource,
                creditUrl: asset.creditUrl,
                creditLicense: asset.creditLicense,
              }}
            />
            <SubmitButton icon="check">Guardar descripción</SubmitButton>
          </form>
          <form action={remove} className="border-t border-bruma pt-5">
            <input type="hidden" name="id" value={asset.id} />
            <FormAlert state={deleted} />
            {asset.usedIn.length ? (
              <p className="text-sm text-pizarra">Para eliminarla, primero pon otra imagen en los espacios donde está en uso.</p>
            ) : (
              <SubmitButton
                variant="outline"
                icon="trash"
                pendingLabel="Eliminando…"
                className="border-peligroso/40 text-peligroso hover:border-peligroso hover:bg-peligroso/5"
              >
                Eliminar de la biblioteca
              </SubmitButton>
            )}
          </form>
        </div>
      </div>
    </Modal>
  );
}

function Library({ assets }: { assets: readonly AssetView[] }) {
  const [open, setOpen] = useState<AssetView | null>(null);
  const [uploading, setUploading] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setUploading(true)}
        className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-puno px-5 font-bold text-white hover:bg-puno-800"
      >
        <Icon name="upload" size={18} />
        Subir imagen
      </button>
      {assets.length ? (
        <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          {assets.map((a) => (
            <li key={a.id}>
              <button type="button" onClick={() => setOpen(a)} className="group block w-full text-left">
                <Thumb src={a.src} className="aspect-4/3 ring-puno transition group-hover:ring-4 group-focus-visible:ring-4" />
                <span className="mt-2 line-clamp-2 block text-sm text-tinta">{a.alt}</span>
                <span className="text-xs font-semibold text-pizarra">{a.usedIn.length ? `En uso (${a.usedIn.length})` : "Sin usar"}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-pizarra">Todavía no se subieron imágenes.</p>
      )}
      {open && <AssetDialog asset={open} onClose={() => setOpen(null)} />}
      {uploading && (
        <Modal title="Subir imagen a la biblioteca" onClose={() => setUploading(false)}>
          <UploadForm onDone={() => setUploading(false)} />
        </Modal>
      )}
    </div>
  );
}

/** Imágenes del sitio: los espacios (qué foto va en cada lugar) y la biblioteca de lo subido. */
export function MediaManager({ slots, assets }: { slots: readonly SlotView[]; assets: readonly AssetView[] }) {
  const [tab, setTab] = useState<"espacios" | "biblioteca">("espacios");
  return (
    <div>
      <div role="tablist" aria-label="Imágenes" className="inline-flex gap-1 rounded-xl bg-white p-1 ring-1 ring-bruma">
        {(["espacios", "biblioteca"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            id={`tab-${t}`}
            aria-selected={tab === t}
            aria-controls={`panel-${t}`}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-lg px-5 py-2.5 text-sm font-bold",
              tab === t ? "bg-puno text-white" : "text-pizarra hover:text-puno-800",
            )}
          >
            {t === "espacios" ? `Espacios del sitio (${slots.length})` : `Biblioteca (${assets.length})`}
          </button>
        ))}
      </div>
      <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="mt-8">
        {tab === "espacios" ? <SlotBoard slots={slots} assets={assets} /> : <Library assets={assets} />}
      </div>
    </div>
  );
}
