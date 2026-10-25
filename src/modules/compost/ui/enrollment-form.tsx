"use client";

import { motion } from "motion/react";
import { useActionState } from "react";
import { Button } from "@/shared/ui/button";
import { describedBy, Field } from "@/shared/ui/field";
import { Icon } from "@/shared/ui/icon";
import { SPACES } from "../domain/spaces";
import { enrollCompost, type EnrollFormState } from "../server/actions";

const initial: EnrollFormState = { status: "idle" };

export function EnrollmentForm() {
  const [state, action, pending] = useActionState(enrollCompost, initial);
  const errors = state.status === "error" ? state.errors : {};

  if (state.status === "success") {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} role="status" className="py-8">
        <span className="grid size-14 place-items-center rounded-full bg-aprovechable text-white">
          <Icon name="leaf" size={26} />
        </span>
        <h3 className="mt-6 text-3xl font-extrabold text-puno-800">Listo, {state.data.name}. Ya estás en la lista.</h3>
        <p className="mt-4 max-w-[52ch] text-lg text-pizarra">
          Un promotor ambiental te llamará para coordinar la entrega del kit y la primera charla. Tu código de inscripción es{" "}
          <strong className="numeral text-2xl text-puno">{state.data.code}</strong>.
        </p>
      </motion.div>
    );
  }

  return (
    <form action={action} className="grid gap-6 sm:grid-cols-2">
      <Field id="c-name" label="Nombre y apellido" error={errors.name}>
        <input
          id="c-name"
          name="name"
          required
          minLength={3}
          autoComplete="name"
          className="field"
          aria-invalid={!!errors.name}
          aria-describedby={describedBy("c-name", errors.name)}
        />
      </Field>
      <Field id="c-phone" label="Celular o WhatsApp" error={errors.phone}>
        <input
          id="c-phone"
          name="phone"
          type="tel"
          inputMode="numeric"
          required
          pattern="9[0-9 ]{8,10}"
          autoComplete="tel-national"
          className="field tabular-nums"
          aria-invalid={!!errors.phone}
          aria-describedby={describedBy("c-phone", errors.phone)}
        />
      </Field>
      <Field id="c-address" label="Dirección" error={errors.address} className="sm:col-span-2">
        <input
          id="c-address"
          name="address"
          required
          minLength={5}
          autoComplete="street-address"
          className="field"
          aria-invalid={!!errors.address}
          aria-describedby={describedBy("c-address", errors.address)}
        />
      </Field>
      <Field id="c-people" label="Personas en el hogar" error={errors.people}>
        <input
          id="c-people"
          name="people"
          type="number"
          min={1}
          max={20}
          defaultValue={4}
          required
          className="field tabular-nums"
          aria-invalid={!!errors.people}
        />
      </Field>
      <fieldset className="sm:col-span-2">
        <legend className="text-sm font-bold text-tinta">Espacio disponible para la compostera</legend>
        <div className="mt-4 flex flex-wrap gap-2">
          {SPACES.map((s, i) => (
            <label
              key={s.id}
              className="cursor-pointer rounded-xl border border-niebla bg-white px-4 py-2.5 text-sm font-bold transition-colors hover:border-puno has-checked:border-puno has-checked:bg-puno has-checked:text-white has-focus-visible:outline-3 has-focus-visible:outline-inti"
            >
              <input type="radio" name="space" value={s.id} defaultChecked={i === 0} className="sr-only" />
              {s.label}
            </label>
          ))}
        </div>
        {errors.space && <p className="mt-2 text-sm font-medium text-peligroso">{errors.space[0]}</p>}
      </fieldset>
      <label className="flex cursor-pointer items-start gap-4 sm:col-span-2">
        <input type="checkbox" name="commitment" required className="mt-1 size-5 shrink-0 accent-puno" />
        <span className="text-pizarra">
          Me comprometo a separar los residuos orgánicos de mi casa y a asistir a la charla de inicio.
          {errors.commitment && <span className="mt-1 block font-medium text-peligroso">{errors.commitment[0]}</span>}
        </span>
      </label>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending} icon={pending ? undefined : "arrow"}>
          {pending ? "Inscribiendo…" : "Inscribirme al programa"}
        </Button>
      </div>
    </form>
  );
}
