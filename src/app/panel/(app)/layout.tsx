import type { ReactNode } from "react";
import { Suspense } from "react";
import { PanelSidebar } from "../_componentes/sidebar";

/**
 * Estructura del panel con sesión. La sesión se lee dentro de Suspense (Cache Components): el marco sale
 * al instante y la barra lateral llega cuando se verifica el usuario.
 */
export default function PanelAppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside>
        <Suspense fallback={<div className="h-20 bg-puno-800 lg:h-dvh" />}>
          <PanelSidebar />
        </Suspense>
      </aside>
      <main id="contenido" className="min-w-0 px-4 py-8 md:px-8 lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  );
}
