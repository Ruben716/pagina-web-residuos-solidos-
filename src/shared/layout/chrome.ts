import type { Media } from "@/shared/content/media";
import type { IconName } from "@/shared/ui/icon";

/**
 * Datos que necesitan el encabezado, la barra superior y el pie. Llegan como props desde la capa de
 * aplicación (app/_componentes/site-chrome.tsx), que los arma con la identidad y las imágenes del panel.
 */
export interface Chrome {
  institution: string;
  office: string;
  logo: Pick<Media, "src" | "alt" | "width" | "height">;
  contact: {
    address: string;
    phone: string;
    phoneHref: string;
    serenazgo: string;
    serenazgoHref: string;
    email: string;
    hours: string;
  };
  social: readonly { label: string; href: string; icon: IconName }[];
  links: { portal: string; transparency: string; tramite: string; gobpe: string };
}

export type BrandData = Pick<Chrome, "institution" | "office" | "logo">;
