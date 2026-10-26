import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireUser } from "@/modules/auth";
import { listImageChoices } from "@/modules/media";
import { findArticle, toInput } from "@/modules/news";
import { ArticleEditor } from "@/modules/news/ui/article-editor";
import { Icon } from "@/shared/ui/icon";
import { PanelHeader, PanelSkeleton } from "../../../_componentes/panel-header";

export const metadata: Metadata = { title: "Editar nota" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export default function EditarNotaPage({ params, searchParams }: PageProps<"/panel/noticias/[id]">) {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <Editor params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Editor({ params, searchParams }: Pick<PageProps<"/panel/noticias/[id]">, "params" | "searchParams">) {
  await requireUser("content.edit");
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const [found, choices, query] = await Promise.all([findArticle(id), listImageChoices(), searchParams]);
  if (!found) notFound();

  return (
    <>
      <Link href="/panel/noticias" className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-puno hover:underline">
        <Icon name="chevronLeft" size={16} />
        Notas de prensa
      </Link>
      <PanelHeader title={found.article.title} />
      <ArticleEditor
        id={found.article.id}
        initial={toInput(found.article)}
        version={found.version}
        updated={{ at: found.updatedAt.toISOString(), by: found.updatedBy }}
        choices={choices}
        created={"creada" in query}
      />
    </>
  );
}
