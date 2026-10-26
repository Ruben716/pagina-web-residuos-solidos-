import { cacheLife } from "next/cache";
import Link from "next/link";
import { NAV, REPORT_CTA } from "@/shared/config/site";
import { Icon } from "@/shared/ui/icon";
import { Brand } from "./brand";
import type { Chrome } from "./chrome";

export function SiteFooter({ chrome }: { chrome: Chrome }) {
  return (
    <footer className="relative overflow-hidden bg-puno-800 text-white">
      <div aria-hidden className="lake-waves absolute inset-x-0 top-0 text-puno-500/60" />
      <div className="shell grid gap-12 pt-16 pb-12 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Brand brand={chrome} tone="light" />
          <p className="mt-6 max-w-[40ch] text-sm leading-relaxed text-white/75">
            Recolección, segregación, valorización y disposición final de los residuos sólidos de la ciudad de Puno, frente al lago
            navegable más alto del mundo.
          </p>
          <ul className="mt-6 flex gap-2">
            {chrome.social.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="grid size-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                >
                  <Icon name={s.icon} size={18} />
                  <span className="sr-only">{s.label} (se abre en otra pestaña)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Servicios" className="lg:col-span-3">
          <h2 className="text-sm font-bold tracking-[0.12em] text-white uppercase">Servicios</h2>
          <ul className="mt-5 space-y-3 text-sm text-white/80">
            {[
              ...NAV,
              { href: "/noticias", label: "Notas de prensa" },
              REPORT_CTA,
              { href: "/reporta/seguimiento", label: "Seguimiento de reportes" },
            ].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="link-underline hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <address className="not-italic lg:col-span-3">
          <h2 className="text-sm font-bold tracking-[0.12em] text-white uppercase">Contacto y atención</h2>
          <ul className="mt-5 space-y-4 text-sm text-white/80">
            <li className="flex gap-3">
              <Icon name="pin" size={18} className="mt-0.5 shrink-0 text-celeste" />
              Palacio Municipal: {chrome.contact.address}
            </li>
            <li className="flex gap-3">
              <Icon name="phone" size={18} className="mt-0.5 shrink-0 text-celeste" />
              <a href={chrome.contact.phoneHref} className="link-underline hover:text-white">
                Central telefónica {chrome.contact.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <Icon name="mail" size={18} className="mt-0.5 shrink-0 text-celeste" />
              <a href={`mailto:${chrome.contact.email}`} className="link-underline break-all hover:text-white">
                {chrome.contact.email}
              </a>
            </li>
            <li className="flex gap-3">
              <Icon name="clock" size={18} className="mt-0.5 shrink-0 text-celeste" />
              {chrome.contact.hours}
            </li>
          </ul>
        </address>

        <nav aria-label="Enlaces de interés" className="lg:col-span-2">
          <h2 className="text-sm font-bold tracking-[0.12em] text-white uppercase">Enlaces</h2>
          <ul className="mt-5 space-y-3 text-sm text-white/80">
            {[
              { href: chrome.links.portal, label: "Portal municipal" },
              { href: chrome.links.transparency, label: "Portal de Transparencia" },
              { href: chrome.links.tramite, label: "Mesa de partes virtual" },
              { href: chrome.links.gobpe, label: "MPP en gob.pe" },
            ].map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noreferrer" className="link-underline hover:text-white">
                  {l.label}
                  <span className="sr-only"> (se abre en otra pestaña)</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/15">
        <div className="shell flex flex-col gap-3 py-6 text-xs text-white/65 md:flex-row md:items-center md:justify-between">
          <p>
            © <CopyrightYear /> {chrome.institution}. {chrome.office}.
          </p>
          <Link href="/creditos" className="link-underline hover:text-white">
            Créditos fotográficos
          </Link>
        </div>
      </div>
    </footer>
  );
}

async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}
