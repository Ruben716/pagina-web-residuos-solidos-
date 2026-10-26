"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Icon, type IconName } from "@/shared/ui/icon";

export function PanelNavLink({ href, icon, children }: { href: string; icon: IconName; children: ReactNode }) {
  const pathname = usePathname();
  const active = href === "/panel" ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-xl px-3 font-semibold transition-colors",
        active ? "bg-white text-puno-800" : "text-white/85 hover:bg-white/10 hover:text-white",
      )}
    >
      <Icon name={icon} size={18} />
      {children}
    </Link>
  );
}
