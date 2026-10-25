export const SITE = {
  institution: "Municipalidad Provincial de Puno",
  office: "Gerencia de Gestión Integral de Residuos Sólidos",
  officeShort: "GGIRS",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description:
    "Rutas y horarios de recolección, guía de segregación, compostaje municipal, campañas Sumaq Ayni y reportes vecinales de la Gerencia de Gestión Integral de Residuos Sólidos de la Municipalidad Provincial de Puno.",
  // Dirección, central, serenazgo, correo y anexo de la GGIRS: Directorio Municipal 2026 de portal.munipuno.gob.pe.
  // El horario de atención viene del sitio anterior: confirmar con la gerencia.
  contact: {
    address: "Jr. Deustua N.° 458, Plaza de Armas, Puno",
    phone: "(051) 601000",
    phoneHref: "tel:+5151601000",
    serenazgo: "(051) 601010",
    serenazgoHref: "tel:+5151601010",
    email: "ggiresiduossolidos@munipuno.gob.pe",
    extension: "1060",
    hours: "Lunes a viernes, de 8:00 a. m. a 4:30 p. m.",
  },
  social: [
    { label: "Facebook", href: "https://www.facebook.com/municipalidadpuno/", icon: "facebook" },
    { label: "Instagram", href: "https://www.instagram.com/munipuno/", icon: "instagram" },
    { label: "TikTok", href: "https://www.tiktok.com/@tumunipuno", icon: "tiktok" },
  ],
  links: {
    portal: "https://portal.munipuno.gob.pe",
    transparency: "https://www.transparencia.gob.pe/enlaces/pte_transparencia_enlaces.aspx?id_entidad=1772&id_tema=1&ver=D",
    gobpe: "https://www.gob.pe/munipuno",
    tramite: "http://tramite.munipuno.gob.pe/muni/",
  },
  /**
   * Mosaicos del mapa base. OSM sirve para tráfico bajo; en producción conviene un proveedor
   * propio o contratado (NEXT_PUBLIC_MAP_TILES / NEXT_PUBLIC_MAP_ATTRIBUTION).
   */
  map: {
    tiles: process.env.NEXT_PUBLIC_MAP_TILES ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ?? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
} as const;

export interface NavItem {
  href: string;
  label: string;
  hint: string;
}

export const NAV: readonly NavItem[] = [
  { href: "/rutas", label: "Rutas y horarios", hint: "Por dónde y cuándo pasa el camión" },
  { href: "/segregacion", label: "Segregación", hint: "Qué va en cada color" },
  { href: "/compostaje", label: "Compostaje", hint: "Programa municipal" },
  { href: "/campanas", label: "Sumaq Ayni", hint: "Campañas y voluntariado" },
  { href: "/noticias", label: "Actualidad", hint: "Noticias e impacto" },
  { href: "/preguntas", label: "Preguntas", hint: "Orientación vecinal" },
];

export const REPORT_CTA = { href: "/reporta", label: "Reporta a tu vecino" };
