import Image from "next/image";
import Link from "next/link";
import { MEDIA } from "@/shared/content/media";
import { RevealGroup, RevealItem } from "@/shared/motion/reveal";
import { Icon } from "@/shared/ui/icon";
import { PORTAL_LINKS } from "../data";

/** Índice de servicios en filas amplias: al pasar el cursor la fila se tiñe y asoma la foto del servicio. */
export function PortalLinks() {
  return (
    <RevealGroup as="ul" className="border-t border-bruma">
      {PORTAL_LINKS.map((l, i) => {
        const media = MEDIA[l.image];
        return (
          <RevealItem as="li" key={l.href} className="border-b border-bruma">
            <Link
              href={l.href}
              className="group relative flex items-center gap-4 overflow-hidden px-2 py-5 transition-colors duration-500 hover:bg-cielo sm:gap-6 md:px-4 md:py-6"
            >
              <span className="numeral hidden w-10 shrink-0 text-lg text-puno-500 sm:block">{String(i + 1).padStart(2, "0")}</span>
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-celeste-50 text-puno transition-colors duration-500 group-hover:bg-puno group-hover:text-white">
                <Icon name={l.icon} size={24} />
              </span>
              <span className="min-w-0 flex-1 md:flex md:items-baseline md:gap-8">
                <span className="block text-xl font-extrabold text-puno-800 md:w-64 md:shrink-0 md:text-2xl">{l.title}</span>
                <span className="mt-1 block text-pizarra md:mt-0">{l.text}</span>
              </span>
              <span
                aria-hidden
                className="relative hidden h-16 w-28 shrink-0 overflow-hidden rounded-xl opacity-0 transition-all duration-500 ease-out-expo group-hover:opacity-100 lg:block lg:-translate-x-4 lg:group-hover:translate-x-0"
              >
                <Image src={media.src} alt="" fill sizes="112px" className="object-cover" />
              </span>
              <span className="grid size-11 shrink-0 place-items-center rounded-full border border-puno/30 text-puno transition-all duration-500 group-hover:border-puno group-hover:bg-puno group-hover:text-white">
                <Icon name="arrow" size={18} className="transition-transform duration-500 ease-out-expo group-hover:-rotate-45" />
              </span>
            </Link>
          </RevealItem>
        );
      })}
    </RevealGroup>
  );
}
