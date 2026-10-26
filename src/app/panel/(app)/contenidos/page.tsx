import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/modules/auth";
import { listDocMeta } from "@/modules/content";
import { formatDate } from "@/shared/lib/format";
import { Icon } from "@/shared/ui/icon";
import { PanelHeader, PanelSkeleton } from "../../_componentes/panel-header";
import { COLLECTIONS } from "./colecciones";

export const metadata: Metadata = { title: "Contenidos" };

export default function ContenidosPage() {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <Index />
    </Suspense>
  );
}

async function Index() {
  await requireUser("content.edit");
  const meta = await listDocMeta();
  const groups = Map.groupBy(COLLECTIONS, (c) => c.group);

  return (
    <>
      <PanelHeader
        title="Contenidos"
        lede="Listas que se repiten en el sitio: el carrusel, la gerencia, los colores, las campañas, las preguntas… Cada una se publica entera y se puede volver a sus datos originales."
      />
      <div className="space-y-8">
        {[...groups].map(([group, collections]) => (
          <section key={group} aria-labelledby={`g-${group}`}>
            <h2 id={`g-${group}`} className="mb-3 text-sm font-bold tracking-wide text-pizarra uppercase">
              {group}
            </h2>
            <ul className="divide-y divide-bruma rounded-2xl bg-white ring-1 ring-bruma">
              {collections.map(({ view }) => {
                const edited = meta.get(view.key);
                return (
                  <li key={view.key} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4">
                    <div className="min-w-0 flex-1 basis-80">
                      <Link href={`/panel/contenidos/${view.key}`} className="font-extrabold text-puno-800 hover:underline">
                        {view.title}
                      </Link>
                      <p className="mt-0.5 line-clamp-2 text-sm text-pizarra">{view.description}</p>
                    </div>
                    <p className="text-sm text-pizarra">
                      {edited ? (
                        <>
                          Editado el {formatDate(edited.updatedAt.toISOString(), { dateStyle: "medium" })}
                          {edited.updatedBy && <> por {edited.updatedBy}</>}
                        </>
                      ) : (
                        "Datos originales"
                      )}
                    </p>
                    <Link
                      href={view.where}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-sm font-bold text-puno hover:underline"
                    >
                      Ver en el sitio
                      <Icon name="external" size={14} />
                      <span className="sr-only">(abre en otra pestaña)</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
