import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { countUsers, getCurrentUser } from "@/modules/auth";
import { LoginForm } from "@/modules/auth/ui/login-form";
import { SetupForm } from "@/modules/auth/ui/setup-form";
import { getIdentity } from "@/modules/identity";
import { getSiteMedia } from "@/modules/media";
import { Icon } from "@/shared/ui/icon";

export const metadata: Metadata = { title: "Ingresar" };

export default async function IngresarPage() {
  const [identity, { escudo }] = await Promise.all([getIdentity(), getSiteMedia()]);
  return (
    <main id="contenido" className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3">
          <Image src={escudo.src} alt="" width={escudo.width} height={escudo.height} className="h-14 w-auto" priority />
          <p className="leading-tight">
            <span className="block font-extrabold text-puno-800">{identity.institution}</span>
            <span className="block text-sm font-semibold text-puno">{identity.office}</span>
          </p>
        </div>
        <div className="mt-8 rounded-3xl bg-white p-7 shadow-panel ring-1 ring-bruma md:p-9">
          <Suspense fallback={<div aria-busy className="h-72" />}>
            <Gate />
          </Suspense>
        </div>
        <Link href="/" className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-puno hover:underline">
          <Icon name="chevronLeft" size={16} />
          Volver al sitio
        </Link>
      </div>
    </main>
  );
}

/** Si ya hay sesión, al panel; si no hay ningún usuario, crear el primer administrador; si no, ingresar. */
async function Gate() {
  if (await getCurrentUser()) redirect("/panel");
  if ((await countUsers()) === 0) {
    return (
      <>
        <h1 className="text-2xl font-extrabold text-puno-800">Configura el panel</h1>
        <p className="mt-2 mb-6 text-pizarra">Aún no hay usuarios. Crea la cuenta del primer administrador.</p>
        <SetupForm needsCode={Boolean(process.env.PANEL_SETUP_TOKEN)} />
      </>
    );
  }
  return (
    <>
      <h1 className="text-2xl font-extrabold text-puno-800">Panel de administración</h1>
      <p className="mt-2 mb-6 text-pizarra">Ingresa con tu correo institucional.</p>
      <LoginForm />
    </>
  );
}
