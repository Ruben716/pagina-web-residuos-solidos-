import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { can, type Permission } from "../domain/roles";
import { readSession, type SessionUser } from "./session";

/** Usuario de la petición actual; se lee una sola vez por petición aunque lo pidan varios componentes. */
export const getCurrentUser = cache(readSession);

/**
 * Para páginas del panel: exige sesión (y un permiso, si se indica). Sin sesión lleva al ingreso;
 * sin permiso, al inicio del panel. Si la contraseña es temporal, obliga a cambiarla primero.
 */
export async function requireUser(permission?: Permission, { allowTemporary = false } = {}): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/panel/ingresar");
  if (user.mustChangePassword && !allowTemporary) redirect("/panel/cuenta");
  if (permission && !can(user.role, permission)) redirect("/panel?sin-permiso");
  return user;
}

export class NotAllowedError extends Error {}

/** Para Server Actions: no redirige, lanza; la acción responde con un mensaje. */
export async function authorize(permission?: Permission): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new NotAllowedError("Tu sesión terminó. Vuelve a ingresar.");
  if (permission && !can(user.role, permission)) throw new NotAllowedError("No tienes permiso para hacer esto.");
  return user;
}
