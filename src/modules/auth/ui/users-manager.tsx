"use client";

import { useActionState, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { formatDate } from "@/shared/lib/format";
import { describedBy, Field } from "@/shared/ui/field";
import { FormAlert, SubmitButton } from "@/shared/ui/form-feedback";
import { Icon } from "@/shared/ui/icon";
import { ROLE_HINT, ROLE_LABEL, ROLES } from "../domain/roles";
import { changeUser, type CreatedUser, createUser, type UserChange } from "../server/actions";
import type { PanelUser } from "../server/users";

/** Contraseña temporal: se muestra una sola vez, con botón para copiarla. */
function TemporaryPassword({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <span className="mt-2 flex flex-wrap items-center gap-3">
      <code className="rounded-lg bg-white px-3 py-1.5 font-mono text-base font-bold text-tinta ring-1 ring-niebla">{value}</code>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(value);
          setCopied(true);
        }}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-puno hover:underline"
      >
        <Icon name={copied ? "check" : "link"} size={15} />
        {copied ? "Copiada" : "Copiar"}
      </button>
      <span className="w-full text-xs font-medium text-pizarra">Compártela por un medio seguro. Al entrar se le pedirá cambiarla.</span>
    </span>
  );
}

function CreateUser() {
  const [state, action] = useActionState(createUser, { status: "idle" } as CreatedUser);
  const errors = state.status === "error" ? state.errors : undefined;
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormAlert
        state={state}
        success={
          state.status === "success" && (
            <span>
              Cuenta creada para {state.data.name} ({state.data.email}). Contraseña temporal:
              <TemporaryPassword value={state.data.password} />
            </span>
          )
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Field id="new-name" label="Nombre completo" error={errors?.name}>
          <input
            id="new-name"
            name="name"
            required
            className="field"
            aria-invalid={Boolean(errors?.name)}
            aria-describedby={describedBy("new-name", errors?.name)}
          />
        </Field>
        <Field id="new-email" label="Correo" error={errors?.email}>
          <input
            id="new-email"
            name="email"
            type="email"
            required
            className="field"
            aria-invalid={Boolean(errors?.email)}
            aria-describedby={describedBy("new-email", errors?.email)}
          />
        </Field>
      </div>
      <fieldset>
        <legend className="text-sm font-bold text-tinta">Rol</legend>
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          {ROLES.map((r, i) => (
            <label
              key={r}
              className="flex cursor-pointer gap-3 rounded-xl border border-niebla bg-white p-3 transition-colors has-checked:border-puno has-checked:bg-celeste-50"
            >
              <input type="radio" name="role" value={r} defaultChecked={i === 1} className="mt-1 size-4 accent-puno" />
              <span>
                <span className="block text-sm font-bold text-tinta">{ROLE_LABEL[r]}</span>
                <span className="block text-xs text-pizarra">{ROLE_HINT[r]}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <SubmitButton icon="plus" pendingLabel="Creando…">
        Crear cuenta
      </SubmitButton>
    </form>
  );
}

function UserRow({ user, isSelf }: { user: PanelUser; isSelf: boolean }) {
  const [state, action] = useActionState(changeUser, { status: "idle" } as UserChange);
  return (
    <li className={cn("grid gap-4 py-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] lg:items-center", !user.active && "opacity-70")}>
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 font-bold text-tinta">
          {user.name}
          {isSelf && <span className="rounded-full bg-celeste-50 px-2 py-0.5 text-xs font-extrabold text-puno-800">Tú</span>}
          {!user.active && <span className="rounded-full bg-bruma px-2 py-0.5 text-xs font-extrabold text-tinta">Desactivada</span>}
          {user.mustChangePassword && user.active && (
            <span className="rounded-full bg-inti/60 px-2 py-0.5 text-xs font-extrabold text-noche">Contraseña temporal</span>
          )}
        </p>
        <p className="truncate text-sm text-pizarra">{user.email}</p>
        <p className="text-xs text-pizarra">
          {user.lastLoginAt
            ? `Último ingreso: ${formatDate(user.lastLoginAt.toISOString(), { dateStyle: "medium", timeStyle: "short" })}`
            : "Aún no ingresa"}
        </p>
      </div>

      <form action={action} className="flex items-center gap-2">
        <input type="hidden" name="id" value={user.id} />
        <input type="hidden" name="op" value="role" />
        <label htmlFor={`role-${user.id}`} className="sr-only">
          Rol de {user.name}
        </label>
        <select id={`role-${user.id}`} name="role" defaultValue={user.role} className="field min-h-11 py-2">
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABEL[r]}
            </option>
          ))}
        </select>
        <SubmitButton variant="outline" className="min-h-11 shrink-0 px-4" pendingLabel="…">
          Cambiar
        </SubmitButton>
      </form>

      <div className="flex flex-wrap gap-2">
        <form action={action}>
          <input type="hidden" name="id" value={user.id} />
          <input type="hidden" name="op" value="reset" />
          <SubmitButton variant="outline" className="min-h-11 px-4" pendingLabel="…">
            Restablecer contraseña
          </SubmitButton>
        </form>
        {!isSelf && (
          <form action={action}>
            <input type="hidden" name="id" value={user.id} />
            <input type="hidden" name="op" value={user.active ? "deactivate" : "activate"} />
            <SubmitButton variant="outline" className="min-h-11 px-4" pendingLabel="…">
              {user.active ? "Desactivar" : "Activar"}
            </SubmitButton>
          </form>
        )}
      </div>

      {state.status !== "idle" && (
        <div className="lg:col-span-3">
          <FormAlert
            state={state}
            success={
              state.status === "success" && (
                <span>
                  {state.data.message}
                  {state.data.password && <TemporaryPassword value={state.data.password} />}
                </span>
              )
            }
          />
        </div>
      )}
    </li>
  );
}

export function UsersManager({ users, currentUserId }: { users: readonly PanelUser[]; currentUserId: string }) {
  return (
    <div className="space-y-12">
      <section aria-labelledby="usuarios-lista">
        <h2 id="usuarios-lista" className="text-lg font-extrabold text-puno-800">
          Cuentas ({users.length})
        </h2>
        <ul className="mt-2 divide-y divide-bruma border-y border-bruma">
          {users.map((u) => (
            <UserRow key={u.id} user={u} isSelf={u.id === currentUserId} />
          ))}
        </ul>
      </section>
      <section aria-labelledby="usuarios-nuevo" className="rounded-2xl bg-white p-6 ring-1 ring-bruma">
        <h2 id="usuarios-nuevo" className="text-lg font-extrabold text-puno-800">
          Nueva cuenta
        </h2>
        <p className="mt-1 mb-5 text-sm text-pizarra">Se crea con una contraseña temporal que la persona cambia al primer ingreso.</p>
        <CreateUser />
      </section>
    </div>
  );
}
