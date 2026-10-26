import Link from "next/link";
import { can, logout, type Permission, requireUser, ROLE_LABEL } from "@/modules/auth";
import { Icon, type IconName } from "@/shared/ui/icon";
import { PanelNavLink } from "./nav-link";

const ITEMS: readonly { href: string; label: string; icon: IconName; permission?: Permission }[] = [
  { href: "/panel", label: "Inicio", icon: "home" },
  { href: "/panel/noticias", label: "Notas de prensa", icon: "archive", permission: "content.edit" },
  { href: "/panel/textos", label: "Textos", icon: "info", permission: "content.edit" },
  { href: "/panel/contenidos", label: "Contenidos", icon: "list", permission: "content.edit" },
  { href: "/panel/identidad", label: "Identidad y colores", icon: "sprout", permission: "identity.edit" },
  { href: "/panel/imagenes", label: "Imágenes", icon: "camera", permission: "media.edit" },
  { href: "/panel/usuarios", label: "Usuarios", icon: "users", permission: "users.manage" },
  { href: "/panel/historial", label: "Historial", icon: "clock", permission: "audit.view" },
];

/** Barra lateral del panel: solo muestra lo que el rol puede usar. */
export async function PanelSidebar() {
  const user = await requireUser(undefined, { allowTemporary: true });
  const items = ITEMS.filter((i) => !i.permission || can(user.role, i.permission));
  return (
    <div className="flex h-full flex-col gap-6 bg-puno-800 p-5 text-white lg:sticky lg:top-0 lg:h-dvh">
      <Link href="/panel" className="flex items-center gap-2 font-extrabold">
        <span className="grid size-9 place-items-center rounded-xl bg-white/10 text-brote">
          <Icon name="leaf" size={20} />
        </span>
        Panel GGIRS
      </Link>

      {!user.mustChangePassword && (
        <nav aria-label="Panel">
          <ul className="space-y-1">
            {items.map((i) => (
              <li key={i.href}>
                <PanelNavLink href={i.href} icon={i.icon}>
                  {i.label}
                </PanelNavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="mt-auto space-y-3 border-t border-white/15 pt-4 text-sm">
        <div>
          <p className="font-bold">{user.name}</p>
          <p className="text-white/75">{ROLE_LABEL[user.role]}</p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/panel/cuenta" className="font-semibold text-white/85 hover:text-white hover:underline">
            Mi cuenta
          </Link>
          <Link href="/" className="font-semibold text-white/85 hover:text-white hover:underline">
            Ver el sitio
          </Link>
          <form action={logout}>
            <button type="submit" className="font-semibold text-white/85 hover:text-white hover:underline">
              Salir
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
