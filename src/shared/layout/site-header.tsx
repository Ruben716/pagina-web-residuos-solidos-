"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV, REPORT_CTA } from "@/shared/config/site";
import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icon";
import { Brand } from "./brand";
import type { Chrome } from "./chrome";

type HeaderData = Pick<Chrome, "institution" | "office" | "logo" | "contact">;

/** Encabezado con la sección activa marcada según la URL. Va dentro de Suspense (usa usePathname). */
export function SiteHeader({ chrome }: { chrome: HeaderData }) {
  return <HeaderView chrome={chrome} pathname={usePathname()} />;
}

/**
 * Mismo encabezado sin la sección activa: es el respaldo de Suspense. En rutas dinámicas
 * (/rutas/[slug]) la URL no se conoce al precalcular el esqueleto, así que se pinta esto primero.
 */
export function SiteHeaderFallback({ chrome }: { chrome: HeaderData }) {
  return <HeaderView chrome={chrome} pathname={null} />;
}

function HeaderView({ chrome, pathname }: { chrome: HeaderData; pathname: string | null }) {
  const { scrollY } = useScroll();
  const [raised, setRaised] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setRaised(y > 40);
    setHidden(y > 480 && y > prev && !open);
  });

  // Cierra el menú móvil al navegar
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname !== null && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-white transition-[transform,box-shadow] duration-500 ease-out-expo",
        hidden && "-translate-y-full",
        raised ? "shadow-[0_8px_30px_-12px_color-mix(in_srgb,var(--color-noche)_25%,transparent)]" : "shadow-[0_1px_0_var(--color-bruma)]",
      )}
    >
      <div className="shell flex h-(--header-h) items-center justify-between gap-6">
        <Brand brand={chrome} />
        <nav aria-label="Principal" className="hidden xl:block">
          <ul className="flex items-center">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="relative flex h-(--header-h) items-center px-3 text-[0.94rem] font-semibold text-tinta/80 transition-colors hover:text-puno aria-[current=page]:text-puno-800"
                >
                  {item.label}
                  {isActive(item.href) && (
                    <motion.span layoutId="nav-active" className="absolute inset-x-3 bottom-0 h-[3px] rounded-t-full bg-puno-500" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href={REPORT_CTA.href}
            className="hidden min-h-11 items-center gap-2 rounded-xl bg-puno px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-puno-800 sm:inline-flex"
          >
            <Icon name="pin" size={17} />
            Reportar
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu-movil"
            className="grid size-11 place-items-center rounded-xl text-puno-800 transition-colors hover:bg-celeste-50 xl:hidden"
          >
            <span className="sr-only">{open ? "Cerrar menú" : "Abrir menú"}</span>
            <Icon name={open ? "close" : "menu"} size={24} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-movil"
            className="absolute inset-x-0 top-full h-[calc(100dvh-var(--header-h))] overflow-y-auto border-t border-bruma bg-white xl:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
          >
            <nav aria-label="Menú móvil" className="shell py-6">
              <ul className="divide-y divide-bruma">
                {[{ href: "/", label: "Inicio", hint: "Portada" }, ...NAV, { ...REPORT_CTA, hint: "Puntos críticos y botaderos" }].map(
                  (item, i) => (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.04, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Link
                        href={item.href}
                        aria-current={pathname === item.href ? "page" : undefined}
                        className="flex items-center justify-between gap-4 py-4"
                      >
                        <span>
                          <span className="block text-xl font-bold text-puno-800">{item.label}</span>
                          <span className="text-sm text-pizarra">{item.hint}</span>
                        </span>
                        <Icon name="chevronRight" className="text-puno" />
                      </Link>
                    </motion.li>
                  ),
                )}
              </ul>
              <div className="mt-6 rounded-2xl bg-cielo p-5 text-sm text-pizarra">
                <p className="font-bold text-puno-800">{chrome.institution}</p>
                <p className="mt-1">{chrome.contact.address}</p>
                <a href={chrome.contact.phoneHref} className="mt-2 inline-flex items-center gap-2 font-semibold text-puno">
                  <Icon name="phone" size={16} />
                  Central {chrome.contact.phone}
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
