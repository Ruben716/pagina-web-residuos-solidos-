"use server";

import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { record } from "@/modules/audit";
import { authorize, NotAllowedError } from "@/modules/auth";
import { docsContaining } from "@/modules/content";
import { formDataToObject, type FormState } from "@/shared/server/form";
import { assetRef } from "../domain/refs";
import { isSlot, SLOTS } from "../domain/slots";
import { assetMetaSchema, checkFile } from "../domain/upload";
import { clearSlot, deleteAssetRow, findAsset, insertAsset, isAssetInUse, MEDIA_TAG, setSlot, updateAssetMeta } from "./media";
import { removeImage, storeImage } from "./storage";

export type MediaFormState = FormState<{ message: string; assetId?: string }>;

const fail = (message: string, field = "_"): MediaFormState => ({ status: "error", errors: { [field]: [message] } });
/** Éxito: además refresca la pantalla del panel para mostrar la biblioteca al día. */
const done = (message: string, assetId?: string): MediaFormState => {
  refresh();
  return { status: "success", data: { message, assetId } };
};

async function guarded(run: () => Promise<MediaFormState>): Promise<MediaFormState> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof NotAllowedError) return fail(error.message);
    throw error;
  }
}

/** Sube una imagen a la biblioteca y, si viene "slot", la pone de inmediato en ese espacio del sitio. */
export async function uploadMedia(_prev: MediaFormState, formData: FormData): Promise<MediaFormState> {
  return guarded(async () => {
    const user = await authorize("media.edit");
    const file = formData.get("file") as File | null;
    const fileError = checkFile(file);
    if (fileError) return fail(fileError, "file");

    const meta = assetMetaSchema.safeParse(formDataToObject(formData));
    if (!meta.success) return { status: "error", errors: z.flattenError(meta.error).fieldErrors };

    const slot = String(formData.get("slot") ?? "");
    if (slot && !isSlot(slot)) return fail("Ese espacio de imagen no existe.");

    let stored;
    try {
      stored = await storeImage(Buffer.from(await file!.arrayBuffer()));
    } catch {
      return fail("No se pudo leer la imagen. ¿Está dañada? Prueba con otra.", "file");
    }
    const asset = await insertAsset({ ...stored, originalName: file!.name.slice(0, 200), createdBy: user.name }, meta.data);

    if (slot && isSlot(slot)) {
      await setSlot(slot, asset.id, user.name);
      updateTag(MEDIA_TAG);
      await record(user, "media.upload", `Subió «${file!.name}» y la puso en «${SLOTS[slot].label}»`);
      return done(`Listo: la imagen ya está en «${SLOTS[slot].label}».`, asset.id);
    }
    await record(user, "media.upload", `Subió «${file!.name}» a la biblioteca`);
    return done("Imagen subida a la biblioteca.", asset.id);
  });
}

export async function editMediaMeta(_prev: MediaFormState, formData: FormData): Promise<MediaFormState> {
  return guarded(async () => {
    const user = await authorize("media.edit");
    const id = String(formData.get("id") ?? "");
    const asset = await findAsset(id);
    if (!asset) return fail("Esa imagen ya no existe.");
    const meta = assetMetaSchema.safeParse(formDataToObject(formData));
    if (!meta.success) return { status: "error", errors: z.flattenError(meta.error).fieldErrors };

    await updateAssetMeta(id, meta.data);
    // el texto alternativo y el crédito se ven en el sitio si la imagen está en uso
    updateTag(MEDIA_TAG);
    await record(user, "media.edit", `Editó la descripción de «${asset.originalName}»`);
    return done("Cambios guardados.");
  });
}

export async function assignSlot(_prev: MediaFormState, formData: FormData): Promise<MediaFormState> {
  return guarded(async () => {
    const user = await authorize("media.edit");
    const slot = String(formData.get("slot") ?? "");
    const asset = await findAsset(String(formData.get("assetId") ?? ""));
    if (!isSlot(slot)) return fail("Ese espacio de imagen no existe.");
    if (!asset) return fail("Esa imagen ya no existe.");

    await setSlot(slot, asset.id, user.name);
    updateTag(MEDIA_TAG);
    await record(user, "media.assign", `Puso «${asset.originalName}» en «${SLOTS[slot].label}»`);
    return done(`Listo: «${SLOTS[slot].label}» ya muestra la nueva imagen.`);
  });
}

export async function resetSlot(_prev: MediaFormState, formData: FormData): Promise<MediaFormState> {
  return guarded(async () => {
    const user = await authorize("media.edit");
    const slot = String(formData.get("slot") ?? "");
    if (!isSlot(slot)) return fail("Ese espacio de imagen no existe.");

    await clearSlot(slot);
    updateTag(MEDIA_TAG);
    await record(user, "media.reset", `Volvió a la imagen original en «${SLOTS[slot].label}»`);
    return done(`«${SLOTS[slot].label}» volvió a su imagen original.`);
  });
}

export async function deleteMedia(_prev: MediaFormState, formData: FormData): Promise<MediaFormState> {
  return guarded(async () => {
    const user = await authorize("media.edit");
    const asset = await findAsset(String(formData.get("id") ?? ""));
    if (!asset) return fail("Esa imagen ya no existe.");
    if (await isAssetInUse(asset.id)) return fail("Está en uso en el sitio: primero pon otra imagen en ese espacio.");
    if ((await docsContaining(assetRef(asset.id))).length)
      return fail("Está en uso en Contenidos (campañas, carrusel…): primero cámbiala allí.");

    await deleteAssetRow(asset.id);
    await removeImage(asset.file);
    await record(user, "media.delete", `Eliminó «${asset.originalName}» de la biblioteca`);
    return done("Imagen eliminada.");
  });
}
