import { type ReactNode, Suspense } from "react";
import { getIdentity, telHref } from "@/modules/identity";
import { getSiteMedia } from "@/modules/media";
import type { Chrome } from "@/shared/layout/chrome";
import { SiteFooter } from "@/shared/layout/site-footer";
import { SiteHeader, SiteHeaderFallback } from "@/shared/layout/site-header";
import { TopBar } from "@/shared/layout/top-bar";

/** Junta la identidad y las imágenes del panel en lo que necesitan el encabezado y el pie. */
export async function getChrome(): Promise<Chrome> {
  const [identity, media] = await Promise.all([getIdentity(), getSiteMedia()]);
  const { contact, social } = identity;
  return {
    institution: identity.institution,
    office: identity.office,
    logo: media.escudo,
    contact: { ...contact, phoneHref: telHref(contact.phone), serenazgoHref: telHref(contact.serenazgo) },
    social: [
      { label: "Facebook", href: social.facebook, icon: "facebook" as const },
      { label: "Instagram", href: social.instagram, icon: "instagram" as const },
      { label: "TikTok", href: social.tiktok, icon: "tiktok" as const },
    ].filter((s) => s.href),
    links: identity.links,
  };
}

/** Marco del sitio público: barra superior, encabezado, contenido y pie. */
export async function SiteChrome({ children }: { children: ReactNode }) {
  const chrome = await getChrome();
  const { institution, office, logo, contact } = chrome;
  return (
    <>
      <TopBar chrome={chrome} />
      {/* al encabezado (componente de cliente) le llega solo lo que usa; la sección activa llega dentro de Suspense */}
      <Suspense fallback={<SiteHeaderFallback chrome={{ institution, office, logo, contact }} />}>
        <SiteHeader chrome={{ institution, office, logo, contact }} />
      </Suspense>
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <SiteFooter chrome={chrome} />
    </>
  );
}
