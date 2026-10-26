"use client";

import type { ComponentProps, ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/shared/server/form";
import { Button } from "./button";
import { Icon } from "./icon";

/**
 * Aviso del resultado de un formulario: el error general (clave "_") o el mensaje de éxito.
 * Va en una región viva, así los lectores de pantalla lo anuncian sin mover el foco.
 */
export function FormAlert({ state, success }: { state: FormState<unknown>; success?: ReactNode }) {
  const error = state.status === "error" ? state.errors._?.[0] : undefined;
  return (
    <div aria-live="polite">
      {error && (
        <p className="flex items-start gap-2 rounded-xl bg-peligroso/10 px-4 py-3 text-sm font-semibold text-peligroso" role="alert">
          <Icon name="alert" size={18} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
      {state.status === "success" && success && (
        <p className="flex items-start gap-2 rounded-xl bg-exito/10 px-4 py-3 text-sm font-semibold text-exito">
          <Icon name="checkCircle" size={18} className="mt-0.5 shrink-0" />
          {success}
        </p>
      )}
    </div>
  );
}

/** Botón de envío que se desactiva y avisa mientras el formulario se procesa. */
export function SubmitButton({
  children,
  pendingLabel = "Guardando…",
  disabled,
  ...props
}: ComponentProps<typeof Button> & { pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" {...props} disabled={pending || disabled} aria-disabled={pending || disabled}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
