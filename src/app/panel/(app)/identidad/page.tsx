import type { Metadata } from "next";
import { Suspense } from "react";
import { requireUser } from "@/modules/auth";
import { readIdentityForEdit } from "@/modules/identity";
import { IdentityEditor } from "@/modules/identity/ui/identity-editor";
import { formatDate } from "@/shared/lib/format";
import { PanelHeader, PanelSkeleton } from "../../_componentes/panel-header";

export const metadata: Metadata = { title: "Identidad y colores" };

export default function IdentidadPage() {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <Editor />
    </Suspense>
  );
}

async function Editor() {
  await requireUser("identity.edit");
  const { identity, updatedAt, updatedBy } = await readIdentityForEdit();
  return (
    <>
      <PanelHeader
        title="Identidad y colores"
        lede={
          updatedAt
            ? `Última publicación: ${formatDate(updatedAt.toISOString(), { dateStyle: "long", timeStyle: "short" })}${updatedBy ? ` por ${updatedBy}` : ""}.`
            : "Todavía con los valores originales del sitio."
        }
      />
      <IdentityEditor initial={identity} />
    </>
  );
}
