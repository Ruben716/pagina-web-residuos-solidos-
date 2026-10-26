"use server";

import { refresh, updateTag } from "next/cache";
import { record } from "@/modules/audit";
import { authorize, NotAllowedError } from "@/modules/auth";
import { contentTag, deleteContentDoc, readDocForEdit, saveContentDoc, VersionConflictError } from "@/modules/content";
import type { FormState } from "@/shared/server/form";
import { checkValue, entries } from "../domain/define";
import { COPY_PAGES, copyDocKey, isCopyPage } from "../domain/registry";

export type CopyFormState = FormState<{ version: number; message: string }>;

const fail = (message: string, field = "_"): CopyFormState => ({ status: "error", errors: { [field]: [message] } });

/**
 * Publica los textos de una página. El editor envía todos los valores (JSON en "values"); se guardan
 * solo los que difieren del valor de fábrica, así un texto restaurado vuelve a seguir al código.
 */
export async function saveCopy(_prev: CopyFormState, formData: FormData): Promise<CopyFormState> {
  try {
    const user = await authorize("content.edit");
    const page = String(formData.get("page") ?? "");
    if (!isCopyPage(page)) return fail("Esa página no existe.");
    const version = Number(formData.get("version"));
    let values: Record<string, unknown>;
    try {
      values = JSON.parse(String(formData.get("values") ?? ""));
    } catch {
      return fail("No se pudo leer el formulario. Recarga la página.");
    }

    const errors: Record<string, string[]> = {};
    const overrides: Record<string, string> = {};
    for (const entry of entries(COPY_PAGES[page])) {
      const raw = values[entry.key];
      if (raw === undefined) continue;
      const value = checkValue(entry, raw);
      if (value === null) {
        errors[entry.key] = [
          String(raw).trim() ? `Máximo ${entry.max} caracteres.` : "No puede quedar vacío: usa «Restaurar» para volver al original.",
        ];
      } else if (value !== entry.value) overrides[entry.key] = value;
    }
    if (Object.keys(errors).length) return { status: "error", errors };

    const key = copyDocKey(page);
    const current = await readDocForEdit(key);
    if ((current?.version ?? 0) !== version) throw new VersionConflictError();
    const count = Object.keys(overrides).length;
    const next = count ? await saveContentDoc(key, overrides, version, user.name) : 0;
    if (!count && current) await deleteContentDoc(key);

    updateTag(contentTag(key));
    refresh();
    const label = COPY_PAGES[page].label;
    await record(
      user,
      "copy.update",
      count
        ? `Publicó los textos de «${label}» (${count} ${count === 1 ? "cambiado" : "cambiados"})`
        : `Volvió los textos de «${label}» a los originales`,
    );
    return { status: "success", data: { version: next, message: "Publicado: ya se ve en el sitio." } };
  } catch (error) {
    if (error instanceof NotAllowedError || error instanceof VersionConflictError) return fail(error.message);
    throw error;
  }
}
