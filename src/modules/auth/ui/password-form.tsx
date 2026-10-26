"use client";

import { useActionState } from "react";
import type { FormState } from "@/shared/server/form";
import { describedBy, Field } from "@/shared/ui/field";
import { FormAlert, SubmitButton } from "@/shared/ui/form-feedback";
import { changeOwnPassword } from "../server/actions";
import { PasswordFields } from "./password-fields";

export function PasswordForm() {
  const [state, action] = useActionState(changeOwnPassword, { status: "idle" } as FormState);
  const errors = state.status === "error" ? state.errors : undefined;
  return (
    <form action={action} className="max-w-md space-y-5" noValidate>
      <FormAlert state={state} />
      <Field id="current" label="Contraseña actual" error={errors?.current}>
        <input
          id="current"
          name="current"
          type="password"
          autoComplete="current-password"
          required
          className="field"
          aria-invalid={Boolean(errors?.current)}
          aria-describedby={describedBy("current", errors?.current)}
        />
      </Field>
      <PasswordFields errors={errors} />
      <SubmitButton icon="check">Cambiar contraseña</SubmitButton>
    </form>
  );
}
