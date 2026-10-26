import type { Metadata, Viewport } from "next";
import { Kumbh_Sans, Montserrat, Nunito_Sans, Source_Sans_3 } from "next/font/google";
import { getIdentity, ThemeStyle } from "@/modules/identity";
import { getSiteMedia } from "@/modules/media";
import { SITE } from "@/shared/config/site";
import "./globals.css";

// Tipografía del portal oficial munipuno.gob.pe; es la única que se precarga.
const kumbh = Kumbh_Sans({ variable: "--font-kumbh", subsets: ["latin", "latin-ext"], display: "swap" });
// Alternativas que el panel puede elegir: no se precargan, el navegador solo las baja si se usan.
const nunito = Nunito_Sans({ variable: "--font-nunito", subsets: ["latin", "latin-ext"], display: "swap", preload: false });
const source = Source_Sans_3({ variable: "--font-source", subsets: ["latin", "latin-ext"], display: "swap", preload: false });
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin", "latin-ext"], display: "swap", preload: false });

export async function generateMetadata(): Promise<Metadata> {
  const [identity, media] = await Promise.all([getIdentity(), getSiteMedia()]);
  const share = media.recoleccionSelectiva;
  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: `${identity.office} · ${identity.institution}`,
      template: `%s · ${identity.institution}`,
    },
    description: identity.description,
    applicationName: `${identity.institution} · ${identity.officeShort}`,
    openGraph: {
      type: "website",
      locale: "es_PE",
      siteName: identity.institution,
      images: [{ url: share.src, width: share.width, height: share.height, alt: share.alt }],
    },
    twitter: { card: "summary_large_image" },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const identity = await getIdentity();
  return { themeColor: identity.palette["puno-800"], colorScheme: "light" };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const identity = await getIdentity();
  const fonts = [kumbh, nunito, source, montserrat].map((f) => f.variable).join(" ");
  return (
    <html lang="es-PE" className={`${fonts} antialiased`}>
      <head>
        <ThemeStyle identity={identity} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#contenido"
          className="fixed top-3 left-3 z-[70] -translate-y-24 rounded-lg bg-inti px-5 py-3 font-bold text-noche transition-transform focus:translate-y-0"
        >
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
