import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/modules/auth";
import { listAllArticles, STATUSES } from "@/modules/news";
import { cn } from "@/shared/lib/cn";
import { formatDate } from "@/shared/lib/format";
import { ButtonLink } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import { PanelHeader, PanelSkeleton } from "../../_componentes/panel-header";

export const metadata: Metadata = { title: "Notas de prensa" };

export default function NoticiasPanelPage({ searchParams }: PageProps<"/panel/noticias">) {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <List searchParams={searchParams} />
    </Suspense>
  );
}

async function List({ searchParams }: Pick<PageProps<"/panel/noticias">, "searchParams">) {
  await requireUser("content.edit");
  const [articles, params] = await Promise.all([listAllArticles(), searchParams]);
  const drafts = articles.filter((a) => a.status === "draft").length;

  return (
    <>
      <PanelHeader
        title="Notas de prensa"
        lede={`${articles.length} ${articles.length === 1 ? "nota" : "notas"}${drafts ? `, ${drafts} en borrador` : ""}. Las publicadas salen en Notas de prensa y en la portada, de la más reciente a la más antigua.`}
      >
        <ButtonLink href="/panel/noticias/nueva" icon="plus">
          Nueva nota
        </ButtonLink>
      </PanelHeader>
      {"eliminada" in params && (
        <p role="status" className="mb-6 flex items-center gap-2 rounded-xl bg-brote/15 px-4 py-3 font-semibold text-puno-800">
          <Icon name="checkCircle" size={18} />
          Nota eliminada.
        </p>
      )}
      {articles.length ? (
        <ul className="divide-y divide-bruma rounded-2xl bg-white ring-1 ring-bruma">
          {articles.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4">
              <div className="min-w-0 flex-1 basis-80">
                <Link href={`/panel/noticias/${a.id}`} className="font-extrabold text-puno-800 hover:underline">
                  {a.title}
                </Link>
                <p className="mt-0.5 text-sm text-pizarra">
                  <time dateTime={a.date}>{formatDate(a.date, { dateStyle: "medium" })}</time> · {a.category}
                  {a.updatedBy && ` · editada por ${a.updatedBy}`}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-extrabold",
                  a.status === "published" ? "bg-puno text-white" : "bg-inti/40 text-noche",
                )}
              >
                {STATUSES[a.status]}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl bg-white p-6 text-pizarra ring-1 ring-bruma">Todavía no hay notas. Crea la primera.</p>
      )}
    </>
  );
}
