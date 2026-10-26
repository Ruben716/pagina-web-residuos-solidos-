"use server";

import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { record } from "@/modules/audit";
import { authorize, NotAllowedError } from "@/modules/auth";
import type { FormState } from "@/shared/server/form";
import { checkPalette } from "../domain/contrast";
import { FONTS, type Identity, identitySchema, THEME_TOKENS } from "../domain/identity";
import { IDENTITY_TAG, readIdentityForEdit, saveIdentity } from "./identity";

export type IdentityFormState = FormState<{ savedAt: string }>;

const SECTION_LABEL: Record<keyof Identity, string> = {
  institution: "nombre de la institución",
  office: "nombre de la gerencia",
  officeShort: "sigla",
  description: "descripción",
  contact: "datos de contacto",
  social: "redes sociales",
  links: "enlaces de interés",
  palette: "colores",
  font: "tipografía",
};

/** Resumen legible de lo que cambió, para el historial. */
function describeChanges(before: Identity, after: Identity) {
  const parts: string[] = [];
  for (const key of Object.keys(SECTION_LABEL) as (keyof Identity)[]) {
    if (JSON.stringify(before[key]) === JSON.stringify(after[key])) continue;
    if (key === "palette") {
      const changed = THEME_TOKENS.filter((t) => before.palette[t.id] !== after.palette[t.id]).map((t) => t.label.toLowerCase());
      parts.push(`colores (${changed.join(", ")})`);
    } else if (key === "font") {
      parts.push(`tipografía a ${FONTS.find((f) => f.id === after.font)?.label}`);
    } else parts.push(SECTION_LABEL[key]);
  }
  return parts;
}

/** Guarda la identidad completa. El editor la envía como JSON en el campo "identity". */
export async function updateIdentity(_prev: IdentityFormState, formData: FormData): Promise<IdentityFormState> {
  try {
    const user = await authorize("identity.edit");

    let raw: unknown;
    try {
      raw = JSON.parse(String(formData.get("identity") ?? ""));
    } catch {
      return { status: "error", errors: { _: ["No se pudo leer el formulario. Recarga la página."] } };
    }

    const parsed = identitySchema.safeParse(raw);
    if (!parsed.success) {
      // errores con su ruta completa ("contact.email") para marcarlos en el campo
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) (errors[issue.path.join(".")] ??= []).push(issue.message);
      return { status: "error", errors };
    }

    const failing = checkPalette(parsed.data.palette).filter((r) => !r.ok);
    if (failing.length) {
      return {
        status: "error",
        errors: { palette: failing.map((r) => `${r.where}: contraste ${r.ratio.toFixed(1)}:1 (mínimo ${r.min}:1)`) },
      };
    }

    const { identity: before } = await readIdentityForEdit();
    const changes = describeChanges(before, parsed.data);
    if (!changes.length) return { status: "success", data: { savedAt: new Date().toISOString() } };

    await saveIdentity(parsed.data, user.name);
    // el sitio entero lee la identidad: la próxima visita ya la ve
    updateTag(IDENTITY_TAG);
    // el panel también usa la paleta: se vuelve a pintar con los colores nuevos
    refresh();
    await record(user, "identity.update", `Cambió ${changes.join("; ")}`);
    return { status: "success", data: { savedAt: new Date().toISOString() } };
  } catch (error) {
    if (error instanceof NotAllowedError) return { status: "error", errors: { _: [error.message] } };
    if (error instanceof z.ZodError) return { status: "error", errors: { _: ["Datos inválidos."] } };
    throw error;
  }
}
