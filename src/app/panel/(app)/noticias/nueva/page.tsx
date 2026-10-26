import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/modules/auth";
import { listImageChoices } from "@/modules/media";
import { ArticleEditor } from "@/modules/news/ui/article-editor";
import { Icon } from "@/shared/ui/icon";
import { PanelHeader, PanelSkeleton } from "../../../_componentes/panel-header";

export const metadata: Metadata = { title: "Nueva nota" };

export default function NuevaNotaPage() {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <Editor />
    </Suspense>
  );
}

async function Editor() {
  await requireUser("content.edit");
  const choices = await listImageChoices();
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima" }).format(new Date());
  return (
    <>
      <Link href="/panel/noticias" className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-puno hover:underline">
        <Icon name="chevronLeft" size={16} />
        Notas de prensa
      </Link>
      <PanelHeader title="Nueva nota" lede="Empieza como borrador: solo se ve en el sitio cuando la marcas como publicada." />
      <ArticleEditor
        id={null}
        initial={{
          title: "",
          slug: "",
          date: today,
          category: "Intervención",
          excerpt: "",
          body: "",
          image: "cuadrillaLimpieza",
          sourceLabel: "",
          sourceUrl: "",
          status: "draft",
        }}
        version={0}
        updated={null}
        choices={choices}
      />
    </>
  );
}
