"use server";

import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import { record } from "@/modules/audit";
import { authorize, NotAllowedError } from "@/modules/auth";
import type { FormState } from "@/shared/server/form";
import { STATUSES } from "../domain/article";
import { articleSchema } from "../domain/schema";
import { ArticleConflictError, deleteArticleRow, findArticle, insertArticle, NEWS_TAG, slugTaken, updateArticle } from "./articles";
import { forgetPublishedSlugs } from "./slugs";

export type ArticleFormState = FormState<{ version: number; message: string }>;

const fail = (message: string, field = "_"): ArticleFormState => ({ status: "error", errors: { [field]: [message] } });

async function guarded(run: () => Promise<ArticleFormState>): Promise<ArticleFormState> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof NotAllowedError || error instanceof ArticleConflictError) return fail(error.message);
    throw error;
  }
}

/** El sitio (listas, ficha, portada, sitemap y proxy) ve el cambio al momento. */
function publish() {
  updateTag(NEWS_TAG);
  forgetPublishedSlugs();
}

/**
 * Crea o guarda una nota. El editor envía la nota como JSON en "article", y "id"/"version" si ya
 * existe. Al crearla se pasa a su dirección de edición.
 */
export async function saveArticle(_prev: ArticleFormState, formData: FormData): Promise<ArticleFormState> {
  return guarded(async () => {
    const user = await authorize("content.edit");
    const id = String(formData.get("id") ?? "");
    const version = Number(formData.get("version") ?? 0);

    let raw: unknown;
    try {
      raw = JSON.parse(String(formData.get("article") ?? ""));
    } catch {
      return fail("No se pudo leer el formulario. Recarga la página.");
    }
    const parsed = articleSchema.safeParse(raw);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) (errors[issue.path.join(".") || "_"] ??= []).push(issue.message);
      return { status: "error", errors };
    }
    const input = parsed.data;
    if (await slugTaken(input.slug, id || undefined)) return fail("Ya hay otra nota con esta dirección: cámbiala un poco.", "slug");

    if (!id) {
      const created = await insertArticle(input, user.name);
      publish();
      await record(user, "news.create", `Creó la nota «${input.title}» (${STATUSES[input.status].toLowerCase()})`);
      redirect(`/panel/noticias/${created}?creada`);
    }

    const current = await findArticle(id);
    if (!current) return fail("Esta nota ya no existe: alguien la eliminó.");
    const next = await updateArticle(id, input, version, user.name);
    publish();
    refresh();
    const was = current.article.status;
    const change = was === input.status ? "Editó" : input.status === "published" ? "Publicó" : "Pasó a borrador";
    await record(user, "news.update", `${change} la nota «${input.title}»`);
    return {
      status: "success",
      data: {
        version: next,
        message: input.status === "published" ? "Guardada: ya se ve en el sitio." : "Guardada como borrador: no se ve en el sitio.",
      },
    };
  });
}

export async function deleteArticle(_prev: ArticleFormState, formData: FormData): Promise<ArticleFormState> {
  return guarded(async () => {
    const user = await authorize("content.edit");
    const current = await findArticle(String(formData.get("id") ?? ""));
    if (!current) return fail("Esta nota ya no existe.");
    await deleteArticleRow(current.article.id);
    publish();
    await record(user, "news.delete", `Eliminó la nota «${current.article.title}»`);
    redirect("/panel/noticias?eliminada");
  });
}
