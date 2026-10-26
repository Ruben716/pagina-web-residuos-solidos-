import { z } from "zod";
import { PASSWORD_MIN, ROLES } from "./roles";

const email = z.email("Escribe un correo válido.").transform((v) => v.trim().toLowerCase());
const name = z.string().trim().min(3, "Escribe el nombre completo.").max(80);
const password = z.string().min(PASSWORD_MIN, `Usa al menos ${PASSWORD_MIN} caracteres.`).max(200, "Es demasiado larga.");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Escribe tu contraseña."),
});

const confirmed = <T extends { password: string; confirm: string }>(data: T, ctx: z.RefinementCtx) => {
  if (data.password !== data.confirm) ctx.addIssue({ code: "custom", path: ["confirm"], message: "Las contraseñas no coinciden." });
};

export const setupSchema = z
  .object({ name, email, password, confirm: z.string(), setupCode: z.string().optional() })
  .superRefine(confirmed);

export const newUserSchema = z.object({ name, email, role: z.enum(ROLES, "Elige un rol.") });

export const changePasswordSchema = z
  .object({ current: z.string().min(1, "Escribe tu contraseña actual."), password, confirm: z.string() })
  .superRefine(confirmed);
