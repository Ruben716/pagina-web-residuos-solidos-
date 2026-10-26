import { Icon } from "@/shared/ui/icon";
import type { Chrome } from "./chrome";

/** Barra superior del portal municipal: transparencia, central, serenazgo y redes. */
export function TopBar({ chrome }: { chrome: Chrome }) {
  return (
    <div className="bg-puno-800 text-[0.8rem] text-white">
      <div className="shell flex min-h-10 items-center justify-between gap-4">
        <ul className="flex items-center gap-x-5">
          <li>
            <a
              href={chrome.links.transparency}
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
            <a href={chrome.contact.phoneHref} className="inline-flex min-h-10 items-center gap-1.5 hover:underline">
              <Icon name="phone" size={15} />
              Central: {chrome.contact.phone}
            </a>
          </li>
          {chrome.contact.serenazgo && (
            <li className="hidden md:block">
              <a href={chrome.contact.serenazgoHref} className="inline-flex min-h-10 items-center gap-1.5 hover:underline">
                <Icon name="shield" size={15} />
                Serenazgo: {chrome.contact.serenazgo}
              </a>
            </li>
          )}
        </ul>
        <ul className="flex items-center gap-1">
          {chrome.social.map((s) => (
            <li key={s.href}>
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="grid size-9 place-items-center rounded-full transition-colors hover:bg-white/15"
              >
                <Icon name={s.icon} size={16} />
                <span className="sr-only">{s.label} de la Municipalidad (se abre en otra pestaña)</span>
              </a>
            </li>
          ))}
          <li className="ml-2 hidden lg:block">
            <a
              href={chrome.links.portal}
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
