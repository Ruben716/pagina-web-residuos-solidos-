import type { Metadata, Viewport } from "next";
import { Kumbh_Sans } from "next/font/google";
import { SITE } from "@/shared/config/site";
import { SiteFooter } from "@/shared/layout/site-footer";
import { SiteHeader } from "@/shared/layout/site-header";
import { TopBar } from "@/shared/layout/top-bar";
import { ScrollProgress } from "@/shared/motion/scroll-progress";
import { SmoothScroll } from "@/shared/motion/smooth-scroll";
import "./globals.css";

// Tipografía del portal oficial munipuno.gob.pe
const kumbh = Kumbh_Sans({
  variable: "--font-kumbh",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.office} · ${SITE.institution}`,
    template: `%s · ${SITE.institution}`,
  },
  description: SITE.description,
  applicationName: `${SITE.institution} · ${SITE.officeShort}`,
  openGraph: {
    type: "website",
    locale: "es_PE",
    siteName: SITE.institution,
    images: [{ url: "/images/flota-rutas.webp", width: 2016, height: 1134 }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#004173",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-PE" className={`${kumbh.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#contenido"
          className="fixed top-3 left-3 z-[70] -translate-y-24 rounded-lg bg-inti px-5 py-3 font-bold text-noche transition-transform focus:translate-y-0"
        >
          Saltar al contenido
        </a>
        <SmoothScroll>
          <ScrollProgress />
          <TopBar />
          <SiteHeader />
          <main id="contenido" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </SmoothScroll>
      </body>
    </html>
  );
}
