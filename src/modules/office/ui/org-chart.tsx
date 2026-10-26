import { getIdentity, telHref } from "@/modules/identity";
import { Reveal, RevealGroup, RevealItem } from "@/shared/motion/reveal";
import { Icon } from "@/shared/ui/icon";
import { OFFICE_SOURCES, type Unit } from "../data";
import { getOfficeContent } from "../server/content";

function Mail({ unit }: { unit: Unit }) {
  return (
    <a href={`mailto:${unit.email}`} className="mt-3 inline-flex items-center gap-2 text-sm font-bold break-all text-puno hover:underline">
      <Icon name="mail" size={16} className="shrink-0" />
      {unit.email}
    </a>
  );
}

/** Organigrama de la gerencia: gerencia arriba, dos subgerencias unidas por un trazo, y datos de atención. */
export async function OrgChart() {
  const [{ contact }, { management: MANAGEMENT, subunits: SUBUNITS }] = await Promise.all([getIdentity(), getOfficeContent()]);
  const phoneHref = telHref(contact.phone);
  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-16">
      <div>
        <Reveal className="relative rounded-3xl bg-puno-800 p-6 text-white md:p-8">
          <p className="text-xs font-extrabold tracking-[0.14em] text-celeste-200 uppercase">{MANAGEMENT.role}</p>
          <p className="mt-1 text-2xl font-extrabold md:text-3xl">{MANAGEMENT.head}</p>
          <p className="mt-1 text-white/80">{MANAGEMENT.name}</p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
            <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2 break-all hover:underline">
              <Icon name="mail" size={16} className="shrink-0 text-brote" />
              {contact.email}
            </a>
            <a href={phoneHref} className="inline-flex items-center gap-2 hover:underline">
              <Icon name="phone" size={16} className="shrink-0 text-brote" />
              {contact.phone}, anexo {contact.extension}
            </a>
          </div>
        </Reveal>

        {/* trazo del organigrama: baja de la gerencia y se abre a cada subgerencia */}
        <div aria-hidden className="mx-auto hidden h-8 w-1/2 border-x-2 border-t-2 border-puno-500/50 md:block" />
        <div aria-hidden className="mx-auto h-6 w-0.5 bg-puno-500/50 md:hidden" />

        <RevealGroup as="ul" className="grid gap-6 md:grid-cols-2">
          {SUBUNITS.map((u) => (
            <RevealItem as="li" key={u.email} className="rounded-3xl border-t-4 border-puno-500 bg-white p-6 shadow-panel">
              <p className="text-lg leading-snug font-extrabold text-puno-800">{u.name}</p>
              <p className="mt-2 text-sm font-semibold text-tinta">
                {u.role}: {u.head}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-pizarra">{u.summary}</p>
              <Mail unit={u} />
            </RevealItem>
          ))}
        </RevealGroup>
        <p className="mt-6 text-xs text-pizarra">
          Fuente:{" "}
          <a href={OFFICE_SOURCES.directorio.url} target="_blank" rel="noreferrer" className="underline hover:text-puno">
            {OFFICE_SOURCES.directorio.label}
            <span className="sr-only"> (se abre en otra pestaña)</span>
          </a>
        </p>
      </div>

      <Reveal delay={0.15}>
        <address className="not-italic">
          <h3 className="text-xl font-extrabold text-puno-800">Atención al vecino</h3>
          <ul className="mt-5 divide-y divide-niebla border-y border-niebla">
            {[
              { icon: "pin" as const, label: "Dirección", value: `Palacio Municipal, ${contact.address}` },
              { icon: "clock" as const, label: "Horario", value: contact.hours },
              {
                icon: "phone" as const,
                label: "Central",
                value: `${contact.phone}, anexo ${contact.extension}`,
                href: phoneHref,
              },
              { icon: "mail" as const, label: "Correo", value: contact.email, href: `mailto:${contact.email}` },
            ].map((row) => (
              <li key={row.label} className="flex gap-4 py-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-puno shadow-sm">
                  <Icon name={row.icon} size={19} />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold tracking-[0.12em] text-pizarra uppercase">{row.label}</span>
                  {row.href ? (
                    <a href={row.href} className="font-semibold break-all text-tinta hover:text-puno hover:underline">
                      {row.value}
                    </a>
                  ) : (
                    <span className="font-semibold text-tinta">{row.value}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </address>
      </Reveal>
    </div>
  );
}
