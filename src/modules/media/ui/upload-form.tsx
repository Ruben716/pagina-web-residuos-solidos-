"use client";

import { useActionState, useState } from "react";
import { describedBy, Field } from "@/shared/ui/field";
import { FormAlert, SubmitButton } from "@/shared/ui/form-feedback";
import { Icon } from "@/shared/ui/icon";
import { ACCEPTED_TYPES, checkFile, MAX_UPLOAD_MB } from "../domain/upload";
import { type MediaFormState, uploadMedia } from "../server/actions";

/** Campos de descripción y crédito: los comparten la subida y la edición. */
export function MetaFields({
  prefix,
  errors,
  defaults,
}: {
  prefix: string;
  errors?: Record<string, string[] | undefined>;
  defaults?: Record<string, string | null>;
}) {
  const id = (k: string) => `${prefix}-${k}`;
  return (
    <>
      <Field
        id={id("alt")}
        label="Descripción de la imagen"
        hint="Qué se ve, en una frase. La leen las personas ciegas y los buscadores."
        error={errors?.alt}
      >
        <textarea
          id={id("alt")}
          name="alt"
          rows={2}
          required
          defaultValue={defaults?.alt ?? ""}
          className="field"
          aria-invalid={Boolean(errors?.alt)}
          aria-describedby={describedBy(id("alt"), errors?.alt, true)}
        />
      </Field>
      <details className="rounded-xl bg-cielo px-4 py-3" open={Boolean(defaults?.creditAuthor)}>
        <summary className="cursor-pointer text-sm font-bold text-puno-800">Crédito (si la foto no es de la Municipalidad)</summary>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field id={id("creditAuthor")} label="Autor" optional error={errors?.creditAuthor}>
            <input id={id("creditAuthor")} name="creditAuthor" defaultValue={defaults?.creditAuthor ?? ""} className="field" />
          </Field>
          <Field id={id("creditSource")} label="Fuente" optional error={errors?.creditSource}>
            <input
              id={id("creditSource")}
              name="creditSource"
              placeholder="Wikimedia Commons"
              defaultValue={defaults?.creditSource ?? ""}
              className="field"
            />
          </Field>
          <Field id={id("creditUrl")} label="Enlace a la original" optional error={errors?.creditUrl}>
            <input id={id("creditUrl")} name="creditUrl" type="url" defaultValue={defaults?.creditUrl ?? ""} className="field" />
          </Field>
          <Field id={id("creditLicense")} label="Licencia" optional error={errors?.creditLicense}>
            <input
              id={id("creditLicense")}
              name="creditLicense"
              placeholder="CC BY-SA 4.0"
              defaultValue={defaults?.creditLicense ?? ""}
              className="field"
            />
          </Field>
        </div>
      </details>
    </>
  );
}

/**
 * Subida de una imagen con vista previa. Con `slot`, la imagen va directo a ese espacio del sitio;
 * sin él, queda en la biblioteca.
 */
export function UploadForm({ slot, onDone, onUploaded }: { slot?: string; onDone?: () => void; onUploaded?: (assetId: string) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [state, action] = useActionState(
    async (prev: MediaFormState, data: FormData) => {
      const result = await uploadMedia(prev, data);
      if (result.status === "success") {
        if (result.data.assetId) onUploaded?.(result.data.assetId);
        onDone?.();
      }
      return result;
    },
    { status: "idle" } as MediaFormState,
  );
  const errors = state.status === "error" ? state.errors : undefined;
  const prefix = `up-${slot ?? "lib"}`;

  return (
    <form action={action} className="space-y-5" noValidate>
      {slot && <input type="hidden" name="slot" value={slot} />}
      <FormAlert state={state} success={state.status === "success" && state.data.message} />

      <Field
        id={`${prefix}-file`}
        label="Imagen"
        hint={`JPG, PNG, WebP o AVIF, hasta ${MAX_UPLOAD_MB} MB. Se ajusta y comprime sola.`}
        error={fileError ?? errors?.file}
      >
        <label
          htmlFor={`${prefix}-file`}
          className="relative grid min-h-44 cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-niebla bg-cielo text-center transition-colors hover:border-puno"
        >
          {preview ? (
            // vista previa local (objectURL): next/image no aplica a archivos que aún no se suben
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="max-h-64 w-auto object-contain" />
          ) : (
            <span className="flex flex-col items-center gap-2 px-4 py-6 text-pizarra">
              <Icon name="upload" size={28} className="text-puno" />
              <span className="font-bold text-tinta">Elige una imagen</span>
              <span className="text-sm">o arrástrala aquí</span>
            </span>
          )}
          <input
            id={`${prefix}-file`}
            name="file"
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            required
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-describedby={describedBy(`${prefix}-file`, fileError ?? errors?.file, true)}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (preview) URL.revokeObjectURL(preview);
              setFileError(checkFile(file));
              setPreview(file && !checkFile(file) ? URL.createObjectURL(file) : null);
            }}
          />
        </label>
      </Field>

      <MetaFields prefix={prefix} errors={errors} />

      <SubmitButton icon="upload" disabled={!preview} pendingLabel="Subiendo y optimizando…">
        {slot ? "Subir y usar aquí" : "Subir a la biblioteca"}
      </SubmitButton>
    </form>
  );
}
