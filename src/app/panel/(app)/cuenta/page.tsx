import type { Metadata } from "next";
import { Suspense } from "react";
import { requireUser, ROLE_LABEL } from "@/modules/auth";
import { PasswordForm } from "@/modules/auth/ui/password-form";
import { Icon } from "@/shared/ui/icon";
import { PanelHeader, PanelSkeleton } from "../../_componentes/panel-header";

export const metadata: Metadata = { title: "Mi cuenta" };

export default function CuentaPage() {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <Account />
    </Suspense>
  );
}

async function Account() {
  const user = await requireUser(undefined, { allowTemporary: true });
  return (
    <>
      <PanelHeader title="Mi cuenta" lede={`${user.name} · ${user.email} · ${ROLE_LABEL[user.role]}`} />
      {user.mustChangePassword && (
        <p className="mb-6 flex items-start gap-2 rounded-xl bg-inti/40 px-4 py-3 font-semibold text-noche" role="alert">
          <Icon name="alert" size={18} className="mt-0.5 shrink-0" />
          Estás usando una contraseña temporal. Cámbiala para poder usar el panel.
        </p>
      )}
      <section aria-labelledby="clave" className="rounded-2xl bg-white p-6 ring-1 ring-bruma md:p-8">
        <h2 id="clave" className="mb-5 text-lg font-extrabold text-puno-800">
          Cambiar contraseña
        </h2>
        <PasswordForm />
      </section>
    </>
  );
}
