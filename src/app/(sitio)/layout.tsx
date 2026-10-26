import type { ReactNode } from "react";
import { ScrollProgress } from "@/shared/motion/scroll-progress";
import { SmoothScroll } from "@/shared/motion/smooth-scroll";
import { SiteChrome } from "../_componentes/site-chrome";

/** Sitio público: scroll suave, barra de progreso y el marco con la identidad del panel. */
export default function SitioLayout({ children }: { children: ReactNode }) {
  return (
    <SmoothScroll>
      <ScrollProgress />
      <SiteChrome>{children}</SiteChrome>
    </SmoothScroll>
  );
}
