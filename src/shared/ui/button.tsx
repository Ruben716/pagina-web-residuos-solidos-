import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Icon, type IconName } from "./icon";

type Variant = "solid" | "outline" | "white" | "ghost";

const VARIANTS: Record<Variant, string> = {
  solid: "bg-puno text-white shadow-sm hover:bg-puno-800",
  outline: "border border-puno/40 bg-white text-puno hover:border-puno hover:bg-celeste-50",
  white: "bg-white text-puno-800 shadow-sm hover:bg-celeste-50",
  ghost: "border border-white/50 text-white hover:border-white hover:bg-white/10",
};

const BASE =
  "group/btn relative inline-flex min-h-12 items-center justify-center gap-2.5 overflow-hidden rounded-xl px-5 text-[0.95rem] font-bold transition-[background-color,color,border-color] duration-300 disabled:cursor-not-allowed disabled:opacity-50";

function Content({ children, icon }: { children: ReactNode; icon?: IconName }) {
  return (
    <>
      <span>{children}</span>
      {icon && (
        <span className="relative grid size-5 place-items-center overflow-hidden">
          <Icon name={icon} size={18} className="transition-transform duration-500 ease-out-expo group-hover/btn:translate-x-5" />
          <Icon
            name={icon}
            size={18}
            className="absolute -translate-x-5 transition-transform duration-500 ease-out-expo group-hover/btn:translate-x-0"
          />
        </span>
      )}
    </>
  );
}

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: Variant;
  icon?: IconName;
}

export function ButtonLink({ variant = "solid", icon, className, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={cn(BASE, VARIANTS[variant], className)} {...props}>
      <Content icon={icon}>{children}</Content>
    </Link>
  );
}

interface ButtonProps extends ComponentProps<"button"> {
  variant?: Variant;
  icon?: IconName;
}

export function Button({ variant = "solid", icon, className, children, type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} className={cn(BASE, VARIANTS[variant], className)} {...props}>
      <Content icon={icon}>{children}</Content>
    </button>
  );
}
