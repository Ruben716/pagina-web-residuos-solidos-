import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireUser } from "@/modules/auth";
import { readDocForEdit } from "@/modules/content";
import { CollectionEditor } from "@/modules/content/client";
import { listImageChoices } from "@/modules/media";
import { Icon } from "@/shared/ui/icon";
import { PanelHeader, PanelSkeleton } from "../../../_componentes/panel-header";
import { resetCollection, saveCollection } from "../actions";
import { findCollection, forEditor } from "../colecciones";

export async function generateMetadata({ params }: PageProps<"/panel/contenidos/[clave]">): Promise<Metadata> {
  return { title: findCollection((await params).clave)?.view.title ?? "Contenidos" };
}

export default function ColeccionPage({ params }: PageProps<"/panel/contenidos/[clave]">) {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <Editor params={params} />
    </Suspense>
  );
}

async function Editor({ params }: Pick<PageProps<"/panel/contenidos/[clave]">, "params">) {
  await requireUser("content.edit");
  const collection = findCollection((await params).clave);
  if (!collection) notFound();

  const { view } = collection;
  // lectura directa, sin caché: el panel siempre ve lo publicado
  const [doc, choices] = await Promise.all([readDocForEdit(view.key), listImageChoices()]);
  // si lo guardado ya no cumple el esquema (cambió el código), se edita desde los datos de fábrica
  const stored = doc && collection.schema.safeParse(doc.value);
  const items = stored?.success ? stored.data : collection.defaults;

  return (
    <>
      <Link href="/panel/contenidos" className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-puno hover:underline">
        <Icon name="chevronLeft" size={16} />
        Contenidos
      </Link>
      <PanelHeader title={view.title} lede={view.description}>
        <Link
          href={view.where}
          target="_blank"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-4 font-bold text-puno ring-1 ring-bruma hover:bg-cielo"
        >
          Ver en el sitio
          <Icon name="external" size={16} />
          <span className="sr-only">(abre en otra pestaña)</span>
        </Link>
      </PanelHeader>
      {stored && !stored.success && (
        <p role="alert" className="mb-6 flex items-center gap-2 rounded-xl bg-inti/40 px-4 py-3 font-semibold text-noche">
          <Icon name="alert" size={18} />
          Lo publicado no coincide con el formato actual del sitio. Se muestran los datos originales: revísalos y publica de nuevo.
        </p>
      )}
      <CollectionEditor
        view={view}
        initial={{
          items: forEditor(collection, items),
          version: doc?.version ?? 0,
          updatedAt: doc?.updatedAt.toISOString() ?? null,
          updatedBy: doc?.updatedBy ?? null,
        }}
        choices={choices}
        save={saveCollection}
        reset={resetCollection}
      />
    </>
  );
}
