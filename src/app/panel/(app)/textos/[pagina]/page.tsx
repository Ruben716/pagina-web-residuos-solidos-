import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireUser } from "@/modules/auth";
import { readDocForEdit } from "@/modules/content";
import { COPY_PAGES, copyDocKey, entries, isCopyPage, validOverrides } from "@/modules/copy";
import { CopyEditor } from "@/modules/copy/ui/copy-editor";
import { Icon } from "@/shared/ui/icon";
import { PanelHeader, PanelSkeleton } from "../../../_componentes/panel-header";

export async function generateMetadata({ params }: PageProps<"/panel/textos/[pagina]">): Promise<Metadata> {
  const { pagina } = await params;
  return { title: isCopyPage(pagina) ? `Textos: ${COPY_PAGES[pagina].label}` : "Textos" };
}

export default function TextosPaginaPage({ params }: PageProps<"/panel/textos/[pagina]">) {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <Editor params={params} />
    </Suspense>
  );
}

async function Editor({ params }: Pick<PageProps<"/panel/textos/[pagina]">, "params">) {
  await requireUser("content.edit");
  const { pagina } = await params;
  if (!isCopyPage(pagina)) notFound();

  const page = COPY_PAGES[pagina];
  // lectura directa, sin caché: el panel siempre ve lo publicado
  const doc = await readDocForEdit(copyDocKey(pagina));
  const overrides = validOverrides(pagina, doc?.value);
  const all = entries(page);
  const sections = Object.entries(page.sections).map(([id, s]) => ({ id, label: s.label, entries: all.filter((e) => e.section === id) }));

  return (
    <>
      <Link href="/panel/textos" className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-puno hover:underline">
        <Icon name="chevronLeft" size={16} />
        Textos
      </Link>
      <PanelHeader
        title={page.label}
        lede={`Página ${page.path === "/" ? "de inicio" : page.path}. Los textos cambiados se marcan en celeste y se pueden restaurar uno por uno.`}
      >
        <Link
          href={page.path}
          target="_blank"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-4 font-bold text-puno ring-1 ring-bruma hover:bg-cielo"
        >
          Ver en el sitio
          <Icon name="external" size={16} />
          <span className="sr-only">(abre en otra pestaña)</span>
        </Link>
      </PanelHeader>
      <CopyEditor
        page={pagina}
        sections={sections}
        initial={Object.fromEntries(all.map((e) => [e.key, overrides[e.key] ?? e.value]))}
        version={doc?.version ?? 0}
        updated={doc ? { at: doc.updatedAt.toISOString(), by: doc.updatedBy } : null}
      />
    </>
  );
}
