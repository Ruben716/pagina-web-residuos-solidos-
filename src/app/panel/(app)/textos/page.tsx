import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/modules/auth";
import { listDocMeta, readDocForEdit } from "@/modules/content";
import { COPY_PAGES, copyDocKey, type CopyPageKey, entries, validOverrides } from "@/modules/copy";
import { formatDate } from "@/shared/lib/format";
import { Icon } from "@/shared/ui/icon";
import { PanelHeader, PanelSkeleton } from "../../_componentes/panel-header";

export const metadata: Metadata = { title: "Textos" };

export default function TextosPage() {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <Index />
    </Suspense>
  );
}

async function Index() {
  await requireUser("content.edit");
  const keys = Object.keys(COPY_PAGES) as CopyPageKey[];
  const [meta, docs] = await Promise.all([listDocMeta(), Promise.all(keys.map((k) => readDocForEdit(copyDocKey(k))))]);

  return (
    <>
      <PanelHeader
        title="Textos"
        lede="Titulares, entradillas, botones y párrafos de cada página. El diseño, los menús y los mensajes de los formularios no se cambian aquí."
      />
      <ul className="divide-y divide-bruma rounded-2xl bg-white ring-1 ring-bruma">
        {keys.map((key, i) => {
          const page = COPY_PAGES[key];
          const total = entries(page).length;
          const changed = Object.keys(validOverrides(key, docs[i]?.value)).length;
          const edited = meta.get(copyDocKey(key));
          return (
            <li key={key} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4">
              <div className="min-w-0 flex-1 basis-64">
                <Link href={`/panel/textos/${key}`} className="font-extrabold text-puno-800 hover:underline">
                  {page.label}
                </Link>
                <p className="mt-0.5 text-sm text-pizarra">
                  {page.path} · {total} textos
                </p>
              </div>
              <p className="text-sm text-pizarra">
                {changed && edited
                  ? `${changed} cambiados · ${formatDate(edited.updatedAt.toISOString(), { dateStyle: "medium" })}${edited.updatedBy ? ` por ${edited.updatedBy}` : ""}`
                  : "Originales"}
              </p>
              <Link href={page.path} target="_blank" className="inline-flex items-center gap-1 text-sm font-bold text-puno hover:underline">
                Ver en el sitio
                <Icon name="external" size={14} />
                <span className="sr-only">(abre en otra pestaña)</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
