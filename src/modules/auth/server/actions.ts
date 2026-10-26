"use server";

import { timingSafeEqual } from "node:crypto";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { record } from "@/modules/audit";
import { formDataToObject, type FormState } from "@/shared/server/form";
import { changePasswordSchema, loginSchema, newUserSchema, setupSchema } from "../domain/forms";
import { ROLE_LABEL, ROLES, type Role } from "../domain/roles";
import { authorize, NotAllowedError } from "./guard";
import { dummyHash, hashPassword, temporaryPassword, verifyPassword } from "./password";
import { endSession, endSessionsOf, startSession } from "./session";
import { ensureInitialAdmin } from "./bootstrap";
import { countActiveAdmins, countUsers, findForLogin, findUser, insertUser, passwordHashOf, updateUser } from "./users";

const fail = (message: string, field = "_"): FormState<never> => ({ status: "error", errors: { [field]: [message] } });
const invalid = (error: z.ZodError): FormState<never> => ({ status: "error", errors: z.flattenError(error).fieldErrors });

/** Errores de permiso → mensaje en el formulario; cualquier otro se deja subir. */
async function guarded<T>(run: () => Promise<FormState<T>>): Promise<FormState<T>> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof NotAllowedError) return fail(error.message);
    throw error;
  }
}

// ---------- ingreso ----------

/** Freno contra adivinar contraseñas: 5 intentos fallidos bloquean ese correo 15 minutos. */
const attempts = new Map<string, { fails: number; until: number }>();
const LOCK_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return invalid(parsed.error);
  const { email, password } = parsed.data;

  const now = Date.now();
  const entry = attempts.get(email);
  if (entry && entry.until > now) return fail("Demasiados intentos. Espera 15 minutos o pide a un administrador que te ayude.");

  await ensureInitialAdmin();
  const user = await findForLogin(email);
  const ok = await verifyPassword(password, user?.passwordHash ?? (await dummyHash()));
  if (!user || !ok || !user.active) {
    // un bloqueo ya vencido empieza la cuenta de nuevo
    const fails = (entry?.until === 0 ? entry.fails : 0) + 1;
    attempts.set(email, { fails, until: fails >= LOCK_FAILS ? now + LOCK_MS : 0 });
    return fail(user && ok && !user.active ? "Tu cuenta está desactivada." : "Correo o contraseña incorrectos.");
  }

  attempts.delete(email);
  await updateUser(user.id, { lastLoginAt: new Date() });
  await startSession(user.id);
  redirect(user.mustChangePassword ? "/panel/cuenta" : "/panel");
}

export async function logout() {
  await endSession();
  redirect("/panel/ingresar");
}

// ---------- primer administrador ----------

const sameText = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

/**
 * Crea el primer administrador cuando aún no hay usuarios. En producción exige el código de instalación
 * (PANEL_SETUP_TOKEN), para que nadie más pueda adelantarse al publicar el sitio.
 */
export async function setupFirstAdmin(_prev: FormState, formData: FormData): Promise<FormState> {
  if ((await countUsers()) > 0) return fail("El panel ya tiene administrador. Ingresa con tu cuenta.");

  const parsed = setupSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return invalid(parsed.error);

  const token = process.env.PANEL_SETUP_TOKEN;
  if (!token && process.env.NODE_ENV === "production") {
    return fail("Falta configurar PANEL_SETUP_TOKEN en el servidor para crear el primer administrador.");
  }
  if (token && !sameText(parsed.data.setupCode ?? "", token)) return fail("El código de instalación no es correcto.", "setupCode");

  const { name, email, password } = parsed.data;
  const user = await insertUser({ name, email, role: "admin", passwordHash: await hashPassword(password), mustChangePassword: false });
  await record(user, "user.setup", `Creó el panel con el administrador ${name}`);
  await startSession(user.id);
  redirect("/panel");
}

// ---------- usuarios ----------

export type CreatedUser = FormState<{ name: string; email: string; password: string }>;

export async function createUser(_prev: CreatedUser, formData: FormData): Promise<CreatedUser> {
  return guarded(async () => {
    const actor = await authorize("users.manage");
    const parsed = newUserSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return invalid(parsed.error);
    const { name, email, role } = parsed.data;

    if (await findForLogin(email)) return fail("Ya hay un usuario con ese correo.", "email");
    const password = temporaryPassword();
    await insertUser({ name, email, role, passwordHash: await hashPassword(password), mustChangePassword: true });
    refresh();
    await record(actor, "user.create", `Creó a ${name} (${email}) como ${ROLE_LABEL[role]}`);
    return { status: "success", data: { name, email, password } };
  });
}

export type UserChange = FormState<{ message: string; password?: string }>;

/** Cambios sobre un usuario existente: rol, activar/desactivar o restablecer contraseña. */
export async function changeUser(_prev: UserChange, formData: FormData): Promise<UserChange> {
  return guarded<{ message: string; password?: string }>(async () => {
    const actor = await authorize("users.manage");
    const id = String(formData.get("id") ?? "");
    const op = String(formData.get("op") ?? "");
    const target = await findUser(id);
    if (!target) return fail("Ese usuario ya no existe.");

    const losesAdmin =
      target.role === "admin" && target.active && (op === "deactivate" || (op === "role" && formData.get("role") !== "admin"));
    if (losesAdmin && target.id === actor.id) return fail("No puedes quitarte a ti mismo el acceso de administrador.");
    if (losesAdmin && (await countActiveAdmins()) <= 1) return fail("Debe quedar al menos un administrador activo.");

    switch (op) {
      case "role": {
        const role = String(formData.get("role")) as Role;
        if (!ROLES.includes(role)) return fail("Elige un rol válido.");
        await updateUser(id, { role });
        refresh();
        await record(actor, "user.role", `Cambió el rol de ${target.name} a ${ROLE_LABEL[role]}`);
        return { status: "success", data: { message: `${target.name} ahora es ${ROLE_LABEL[role]}.` } };
      }
      case "deactivate":
      case "activate": {
        const active = op === "activate";
        await updateUser(id, { active });
        if (!active) await endSessionsOf(id);
        refresh();
        await record(actor, `user.${op}`, `${active ? "Activó" : "Desactivó"} la cuenta de ${target.name}`);
        return { status: "success", data: { message: `Cuenta ${active ? "activada" : "desactivada"}.` } };
      }
      case "reset": {
        const password = temporaryPassword();
        await updateUser(id, { passwordHash: await hashPassword(password), mustChangePassword: true });
        await endSessionsOf(id);
        refresh();
        await record(actor, "user.reset", `Restableció la contraseña de ${target.name}`);
        return { status: "success", data: { message: `Contraseña temporal de ${target.name}:`, password } };
      }
      default:
        return fail("Acción desconocida.");
    }
  });
}

// ---------- mi cuenta ----------

export async function changeOwnPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  return guarded(async () => {
    const user = await authorize();
    const parsed = changePasswordSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return invalid(parsed.error);
    const hash = await passwordHashOf(user.id);
    if (!hash || !(await verifyPassword(parsed.data.current, hash))) return fail("La contraseña actual no es correcta.", "current");

    await updateUser(user.id, { passwordHash: await hashPassword(parsed.data.password), mustChangePassword: false });
    // cierra las demás sesiones y abre una nueva en este equipo
    await endSessionsOf(user.id);
    await startSession(user.id);
    await record(user, "user.password", "Cambió su contraseña");
    redirect("/panel");
  });
}
