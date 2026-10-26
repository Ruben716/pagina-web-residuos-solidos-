"use client";

import { useActionState } from "react";
import type { FormState } from "@/shared/server/form";
import { describedBy, Field } from "@/shared/ui/field";
import { FormAlert, SubmitButton } from "@/shared/ui/form-feedback";
import { setupFirstAdmin } from "../server/actions";
import { PasswordFields } from "./password-fields";

/** Primer administrador del panel. Solo aparece mientras no hay ningún usuario. */
export function SetupForm({ needsCode }: { needsCode: boolean }) {
  const [state, action] = useActionState(setupFirstAdmin, { status: "idle" } as FormState);
  const errors = state.status === "error" ? state.errors : undefined;
  return (
    <form action={action} className="space-y-5" noValidate>
      <FormAlert state={state} />
      {needsCode && (
        <Field
          id="setupCode"
          label="Código de instalación"
          hint="Está en la variable PANEL_SETUP_TOKEN del servidor."
          error={errors?.setupCode}
        >
          <input
            id="setupCode"
            name="setupCode"
            autoComplete="off"
            required
            className="field font-mono"
            aria-invalid={Boolean(errors?.setupCode)}
            aria-describedby={describedBy("setupCode", errors?.setupCode, true)}
          />
        </Field>
      )}
      <Field id="name" label="Nombre completo" error={errors?.name}>
        <input
          id="name"
          name="name"
          autoComplete="name"
          required
          className="field"
          aria-invalid={Boolean(errors?.name)}
          aria-describedby={describedBy("name", errors?.name)}
        />
      </Field>
      <Field id="email" label="Correo institucional" error={errors?.email}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="field"
          aria-invalid={Boolean(errors?.email)}
          aria-describedby={describedBy("email", errors?.email)}
        />
      </Field>
      <PasswordFields errors={errors} />
      <SubmitButton icon="arrow" pendingLabel="Creando…" className="w-full">
        Crear administrador y entrar
      </SubmitButton>
    </form>
  );
}
