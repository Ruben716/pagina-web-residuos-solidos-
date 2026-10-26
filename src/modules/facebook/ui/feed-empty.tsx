import { ButtonLink } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import type { FacebookFeed } from "../types";

/** Lo que se ve cuando aún no hay publicaciones: sin token configurado o con Facebook caído. */
export function FeedEmpty({ feed }: { feed: FacebookFeed }) {
  const failed = feed.status === "error";
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center py-10 text-center">
      <span className="grid size-16 place-items-center rounded-2xl bg-celeste-50 text-puno">
        <Icon name="facebook" size={30} />
      </span>
      <h3 className="mt-5 text-2xl font-extrabold text-puno-800">
        {failed ? "No pudimos traer las publicaciones de Facebook" : "Muy pronto verás aquí nuestras publicaciones"}
      </h3>
      <p className="mt-3 text-lg leading-relaxed text-pizarra">
        {failed
          ? "Facebook no respondió. Vuelve a intentarlo en unos minutos o visita directamente nuestra página."
          : "Operativos de limpieza, campañas, avisos de horario y resultados, tal como los publicamos en Facebook."}
      </p>
      <ButtonLink href={feed.pageUrl} target="_blank" rel="noreferrer" icon="external" className="mt-7">
        Ir a nuestra página de Facebook
        <span className="sr-only"> (se abre en otra pestaña)</span>
      </ButtonLink>
    </div>
  );
}
