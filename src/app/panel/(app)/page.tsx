import Link from "next/link";
import { Suspense } from "react";
import { recentChanges } from "@/modules/audit";
import { can, type Permission, requireUser } from "@/modules/auth";
import { formatDate } from "@/shared/lib/format";
import { Icon, type IconName } from "@/shared/ui/icon";
import { PanelHeader, PanelSkeleton } from "../_componentes/panel-header";

const SHORTCUTS: readonly { href: string; title: string; text: string; icon: IconName; permission: Permission }[] = [
  {
    href: "/panel/noticias",
    title: "Notas de prensa",
    text: "Escribe, publica o pasa a borrador las notas de la sala de prensa.",
    icon: "archive",
    permission: "content.edit",
  },
  {
    href: "/panel/textos",
    title: "Textos",
    text: "Titulares, entradillas y botones de cada página del sitio.",
    icon: "info",
    permission: "content.edit",
  },
  {
    href: "/panel/contenidos",
    title: "Contenidos",
    text: "Carrusel, gerencia, colores, campañas, preguntas y filtro de Facebook.",
    icon: "list",
    permission: "content.edit",
  },
  {
    href: "/panel/identidad",
    title: "Identidad y colores",
    text: "Nombre, contacto, redes, paleta y tipografía del sitio.",
    icon: "sprout",
    permission: "identity.edit",
  },
  {
    href: "/panel/imagenes",
    title: "Imágenes",
    text: "Cambia la foto de cada lugar del sitio y administra la biblioteca.",
    icon: "camera",
    permission: "media.edit",
  },
  {
    href: "/panel/usuarios",
    title: "Usuarios",
    text: "Cuentas del panel, roles y contraseñas.",
    icon: "users",
    permission: "users.manage",
  },
  { href: "/panel/historial", title: "Historial", text: "Quién cambió qué y cuándo.", icon: "clock", permission: "audit.view" },
];

export default function PanelHome({ searchParams }: PageProps<"/panel">) {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <Dashboard searchParams={searchParams} />
    </Suspense>
  );
}

async function Dashboard({ searchParams }: Pick<PageProps<"/panel">, "searchParams">) {
  const user = await requireUser();
  const denied = "sin-permiso" in (await searchParams);
  const shortcuts = SHORTCUTS.filter((s) => can(user.role, s.permission));
  const changes = can(user.role, "audit.view") ? await recentChanges(6) : [];

  return (
    <>
      <PanelHeader
        title={`Hola, ${user.name.split(" ")[0]}`}
        lede="Desde aquí cambias las notas, los textos, los contenidos, la identidad y las imágenes del sitio. Los cambios se publican al instante."
      />
      {denied && (
        <p className="mb-6 flex items-center gap-2 rounded-xl bg-inti/40 px-4 py-3 font-semibold text-noche" role="alert">
          <Icon name="alert" size={18} />
          Tu rol no tiene acceso a esa sección.
        </p>
      )}
      {shortcuts.length ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {shortcuts.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="group flex h-full gap-4 rounded-2xl bg-white p-5 ring-1 ring-bruma transition-shadow hover:shadow-panel"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-puno text-white">
                  <Icon name={s.icon} size={22} />
                </span>
                <span>
                  <span className="block font-extrabold text-puno-800 group-hover:underline">{s.title}</span>
                  <span className="mt-1 block text-sm text-pizarra">{s.text}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl bg-white p-6 text-pizarra ring-1 ring-bruma">
          Tu rol todavía no tiene secciones disponibles. Llegarán con la etapa de reportes vecinales.
        </p>
      )}

      {changes.length > 0 && (
        <section aria-labelledby="ultimos" className="mt-10">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="ultimos" className="text-lg font-extrabold text-puno-800">
              Últimos cambios
            </h2>
            <Link href="/panel/historial" className="text-sm font-bold text-puno hover:underline">
              Ver todo
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-bruma rounded-2xl bg-white px-5 ring-1 ring-bruma">
            {changes.map((c) => (
              <li key={c.id} className="py-3 text-sm">
                <span className="font-bold text-tinta">{c.actorName}</span> <span className="text-tinta">{c.summary}</span>
                <span className="block text-xs text-pizarra">
                  {formatDate(c.createdAt.toISOString(), { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
