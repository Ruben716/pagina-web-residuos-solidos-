"use server";

import { refresh, updateTag } from "next/cache";
import { record } from "@/modules/audit";
import { authorize, NotAllowedError } from "@/modules/auth";
import { contentTag, deleteContentDoc, readDocForEdit, saveContentDoc, VersionConflictError } from "@/modules/content";
import type { CollectionFormState } from "@/modules/content/client";
import { type Collection, findCollection, forEditor } from "./colecciones";

const fail = (message: string, field = "_"): CollectionFormState => ({ status: "error", errors: { [field]: [message] } });

async function guarded(run: () => Promise<CollectionFormState>): Promise<CollectionFormState> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof NotAllowedError || error instanceof VersionConflictError) return fail(error.message);
    throw error;
  }
}

/** El sitio y el panel ven la colección nueva al momento. */
function publish(c: Collection) {
  updateTag(contentTag(c.view.key));
  for (const tag of c.tags ?? []) updateTag(tag);
  refresh();
}

/** "2 nuevos, 1 editado, 1 quitado" para el historial; por identificador si la colección lo tiene. */
function describeChanges(c: Collection, before: readonly unknown[], after: readonly unknown[]) {
  const id = c.view.idField;
  const keyOf = (item: unknown, i: number) => (id ? String((item as Record<string, unknown>)[id]) : String(i));
  const old = new Map(before.map((it, i) => [keyOf(it, i), JSON.stringify(it)]));
  const now = new Map(after.map((it, i) => [keyOf(it, i), JSON.stringify(it)]));
  const added = [...now.keys()].filter((k) => !old.has(k)).length;
  const removed = [...old.keys()].filter((k) => !now.has(k)).length;
  const edited = [...now].filter(([k, v]) => old.has(k) && old.get(k) !== v).length;
  const moved = !added && !removed && !edited && id && [...old.keys()].join() !== [...now.keys()].join();
  const parts = [
    added && `${added} ${added === 1 ? "nuevo" : "nuevos"}`,
    edited && `${edited} ${edited === 1 ? "editado" : "editados"}`,
    removed && `${removed} ${removed === 1 ? "quitado" : "quitados"}`,
    moved && "cambió el orden",
  ].filter(Boolean);
  return parts.join(", ");
}

/** Publica la colección completa. El editor la envía como JSON en "items" con la versión que cargó. */
export async function saveCollection(_prev: CollectionFormState, formData: FormData): Promise<CollectionFormState> {
  return guarded(async () => {
    const user = await authorize("content.edit");
    const collection = findCollection(String(formData.get("key") ?? ""));
    if (!collection) return fail("Esa colección no existe.");
    const version = Number(formData.get("version"));
    if (!Number.isInteger(version) || version < 0) return fail("No se pudo leer el formulario. Recarga la página.");

    let raw: unknown;
    try {
      raw = JSON.parse(String(formData.get("items") ?? ""));
    } catch {
      return fail("No se pudo leer el formulario. Recarga la página.");
    }

    const parsed = collection.schema.safeParse(raw);
    if (!parsed.success) {
      // errores con su ruta ("3.question"); los de la colección entera ("Debe quedar al menos…") van arriba
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) (errors[issue.path.join(".") || "_"] ??= []).push(issue.message);
      return { status: "error", errors };
    }

    const current = await readDocForEdit(collection.view.key);
    const before = (current?.value as unknown[] | undefined) ?? collection.defaults;
    const summary = describeChanges(collection, before, parsed.data);
    const next = await saveContentDoc(collection.view.key, parsed.data, version, user.name);

    publish(collection);
    await record(user, "content.update", `Publicó «${collection.view.title}»${summary ? ` (${summary})` : ""}`);
    return {
      status: "success",
      data: { version: next, message: "Publicado: ya se ve en el sitio.", items: forEditor(collection, parsed.data) },
    };
  });
}

/** Vuelve la colección a los datos de fábrica (los del código). */
export async function resetCollection(_prev: CollectionFormState, formData: FormData): Promise<CollectionFormState> {
  return guarded(async () => {
    const user = await authorize("content.edit");
    const collection = findCollection(String(formData.get("key") ?? ""));
    if (!collection) return fail("Esa colección no existe.");

    await deleteContentDoc(collection.view.key);
    publish(collection);
    await record(user, "content.reset", `Volvió «${collection.view.title}» a sus datos originales`);
    return {
      status: "success",
      data: { version: 0, message: "Se restauraron los datos originales.", items: forEditor(collection, collection.defaults) },
    };
  });
}
