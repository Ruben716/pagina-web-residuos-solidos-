"use client";

import { Button } from "@/shared/ui/button";

/** Falla del panel (casi siempre: la base de datos no responde). El sitio público sigue funcionando. */
export default function PanelError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="contenido" className="grid min-h-dvh place-items-center px-4">
      <div className="max-w-md rounded-3xl bg-white p-8 text-center ring-1 ring-bruma">
        <h1 className="text-2xl font-extrabold text-puno-800">El panel no responde</h1>
        <p className="mt-3 text-pizarra">
          No se pudo conectar con la base de datos. El sitio público sigue funcionando con su última versión. Intenta de nuevo en unos
          segundos.
        </p>
        <Button icon="arrow" onClick={reset} className="mt-6">
          Reintentar
        </Button>
      </div>
    </main>
  );
}
