import { SITE } from "@/shared/config/site";
import { Icon, type IconName } from "@/shared/ui/icon";

/** Barra superior del portal municipal: transparencia, central, serenazgo y redes. */
export function TopBar() {
  return (
    <div className="bg-puno-800 text-[0.8rem] text-white">
      <div className="shell flex min-h-10 items-center justify-between gap-4">
        <ul className="flex items-center gap-x-5">
          <li>
            <a
              href={SITE.links.transparency}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 items-center gap-1.5 font-semibold hover:underline"
            >
              <Icon name="building" size={15} />
              Portal de Transparencia
              <span className="sr-only"> (se abre en otra pestaña)</span>
            </a>
          </li>
          <li className="hidden sm:block">
            <a href={SITE.contact.phoneHref} className="inline-flex min-h-10 items-center gap-1.5 hover:underline">
              <Icon name="phone" size={15} />
              Central: {SITE.contact.phone}
            </a>
          </li>
          <li className="hidden md:block">
            <a href={SITE.contact.serenazgoHref} className="inline-flex min-h-10 items-center gap-1.5 hover:underline">
              <Icon name="shield" size={15} />
              Serenazgo: {SITE.contact.serenazgo}
            </a>
          </li>
        </ul>
        <ul className="flex items-center gap-1">
          {SITE.social.map((s) => (
            <li key={s.href}>
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="grid size-9 place-items-center rounded-full transition-colors hover:bg-white/15"
              >
                <Icon name={s.icon as IconName} size={16} />
                <span className="sr-only">{s.label} de la Municipalidad (se abre en otra pestaña)</span>
              </a>
            </li>
          ))}
          <li className="ml-2 hidden lg:block">
            <a
              href={SITE.links.portal}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-white/12 px-3 font-semibold transition-colors hover:bg-white/20"
            >
              munipuno.gob.pe
              <Icon name="external" size={13} />
              <span className="sr-only"> (se abre en otra pestaña)</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
