import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s · Panel de administración" },
  robots: { index: false, follow: false },
};

/** Panel de administración: fuera del marco del sitio público, sin scroll suave ni animaciones de entrada. */
export default function PanelLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh bg-cielo text-tinta">{children}</div>;
}
