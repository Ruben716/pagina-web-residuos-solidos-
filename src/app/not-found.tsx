import Image from "next/image";
import { ButtonLink } from "@/shared/ui/button";

export default function NotFound() {
  return (
    <section className="bg-cielo">
      <div className="shell flex min-h-[70svh] flex-col items-center justify-center py-20 text-center">
        <Image src="/images/mpp/escudo-mpp.png" alt="" width={185} height={240} className="h-24 w-auto opacity-90" />
        <p aria-hidden className="numeral mt-6 text-7xl text-puno-500/40">
          404
        </p>
        <h1 className="mt-3 max-w-[24ch] text-[clamp(1.8rem,4vw,2.75rem)] leading-tight font-extrabold text-puno-800">
          Esta página no está en ninguna ruta
        </h1>
        <p className="mt-4 max-w-[48ch] text-lg text-pizarra">
          Puede que el enlace haya cambiado. Desde el inicio llegas a todos los servicios.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/" icon="arrow">
            Ir al inicio
          </ButtonLink>
          <ButtonLink href="/rutas" variant="outline">
            Ver rutas y horarios
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
