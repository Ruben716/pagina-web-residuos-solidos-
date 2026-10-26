"use client";

import { useState } from "react";
import { describedBy, Field } from "@/shared/ui/field";
import { PASSWORD_MIN } from "../domain/roles";

/** Nueva contraseña + confirmación, con botón para mostrarla (ayuda a no equivocarse en el celular). */
export function PasswordFields({ errors }: { errors?: Record<string, string[] | undefined> }) {
  const [visible, setVisible] = useState(false);
  const type = visible ? "text" : "password";
  return (
    <>
      <Field
        id="password"
        label="Nueva contraseña"
        hint={`Al menos ${PASSWORD_MIN} caracteres. Una frase es más segura que una palabra rara.`}
        error={errors?.password}
      >
        <input
          id="password"
          name="password"
          type={type}
          autoComplete="new-password"
          minLength={PASSWORD_MIN}
          required
          className="field"
          aria-invalid={Boolean(errors?.password)}
          aria-describedby={describedBy("password", errors?.password, true)}
        />
      </Field>
      <Field id="confirm" label="Repite la contraseña" error={errors?.confirm}>
        <input
          id="confirm"
          name="confirm"
          type={type}
          autoComplete="new-password"
          required
          className="field"
          aria-invalid={Boolean(errors?.confirm)}
          aria-describedby={describedBy("confirm", errors?.confirm)}
        />
      </Field>
      <label className="flex items-center gap-2 text-sm font-semibold text-pizarra">
        <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} className="size-4 accent-puno" />
        Mostrar contraseña
      </label>
    </>
  );
}
