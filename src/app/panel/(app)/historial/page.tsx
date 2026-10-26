import type { Metadata } from "next";
import { Suspense } from "react";
import { recentChanges } from "@/modules/audit";
import { requireUser } from "@/modules/auth";
import { formatDate } from "@/shared/lib/format";
import { PanelHeader, PanelSkeleton } from "../../_componentes/panel-header";

export const metadata: Metadata = { title: "Historial" };

export default function HistorialPage() {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <History />
    </Suspense>
  );
}

async function History() {
  await requireUser("audit.view");
  const changes = await recentChanges(200);
  return (
    <>
      <PanelHeader title="Historial" lede="Los últimos 200 cambios hechos en el panel, del más reciente al más antiguo." />
      {changes.length ? (
        <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-bruma">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Cambios del panel</caption>
            <thead className="border-b border-bruma text-xs tracking-[0.08em] text-pizarra uppercase">
              <tr>
                <th scope="col" className="px-5 py-3 font-bold">
                  Fecha
                </th>
                <th scope="col" className="px-5 py-3 font-bold">
                  Quién
                </th>
                <th scope="col" className="px-5 py-3 font-bold">
                  Qué hizo
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bruma">
              {changes.map((c) => (
                <tr key={c.id}>
                  <td className="px-5 py-3 whitespace-nowrap text-pizarra">
                    {formatDate(c.createdAt.toISOString(), { dateStyle: "medium", timeStyle: "short" })}
                  </td>
                  <td className="px-5 py-3 font-bold whitespace-nowrap text-tinta">{c.actorName}</td>
                  <td className="px-5 py-3 text-tinta">{c.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-2xl bg-white p-6 text-pizarra ring-1 ring-bruma">Todavía no hay cambios registrados.</p>
      )}
    </>
  );
}
