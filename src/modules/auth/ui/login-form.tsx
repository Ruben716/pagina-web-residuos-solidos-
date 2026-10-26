"use client";

import { useActionState } from "react";
import type { FormState } from "@/shared/server/form";
import { describedBy, Field } from "@/shared/ui/field";
import { FormAlert, SubmitButton } from "@/shared/ui/form-feedback";
import { login } from "../server/actions";

const err = (s: FormState, k: string) => (s.status === "error" ? s.errors[k] : undefined);

export function LoginForm() {
  const [state, action] = useActionState(login, { status: "idle" } as FormState);
  return (
    <form action={action} className="space-y-5" noValidate>
      <FormAlert state={state} />
      <Field id="email" label="Correo" error={err(state, "email")}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="field"
          aria-invalid={Boolean(err(state, "email"))}
          aria-describedby={describedBy("email", err(state, "email"))}
        />
      </Field>
      <Field id="password" label="Contraseña" error={err(state, "password")}>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="field"
          aria-invalid={Boolean(err(state, "password"))}
          aria-describedby={describedBy("password", err(state, "password"))}
        />
      </Field>
      <SubmitButton icon="arrow" pendingLabel="Ingresando…" className="w-full">
        Ingresar
      </SubmitButton>
    </form>
  );
}
