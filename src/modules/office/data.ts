import { SITE } from "@/shared/config/site";
import type { MediaKey } from "@/shared/content/media";
import type { IconName } from "@/shared/ui/icon";

/**
 * Datos de la Gerencia de Gestión Integral de Residuos Sólidos (GGIRS).
 * Organigrama, cargos y correos: Directorio Municipal 2026 de portal.munipuno.gob.pe.
 * Funciones: notas de prensa de la Municipalidad en gob.pe (2024–2025).
 */
export const OFFICE_SOURCES = {
  directorio: {
    label: "Directorio Municipal 2026, Municipalidad Provincial de Puno",
    url: "https://portal.munipuno.gob.pe/es/directorio-municipal-2026",
  },
  generacion: {
    label: "Radio Onda Azul, declaraciones de la Subgerencia de Limpieza Pública (2026)",
    url: "https://radioondaazul.com/puno-genera-hasta-110-toneladas-de-residuos-al-dia-y-el-60-seria-aprovechable/",
  },
  mercados: {
    label: "Municipalidad Provincial de Puno, nota de prensa sobre el recojo de orgánicos en mercados",
    url: "https://portal.munipuno.gob.pe/es/node/7764",
  },
  centro: {
    label: "gob.pe, nota de prensa del 29 de enero de 2025",
    url: "https://www.gob.pe/institucion/munipuno/noticias/1115779-municipalidad-de-puno-refuerza-la-fiscalizacion-en-puntos-criticos-de-acumulacion-de-residuos-solidos-en-el-centro-de-la-ciudad",
  },
} as const;

export interface Unit {
  name: string;
  head: string;
  role: string;
  email: string;
  extension?: string;
}

export const MANAGEMENT: Unit = {
  name: "Gerencia de Gestión Integral de Residuos Sólidos",
  head: "Lic. Rubén Darío Ramos Lupo",
  role: "Gerente",
  email: SITE.contact.email,
  extension: SITE.contact.extension,
};

export const SUBUNITS: readonly (Unit & { summary: string })[] = [
  {
    name: "Subgerencia de Limpieza Pública y Recolección",
    head: "Lic. Eva Fernández Arpa",
    role: "Subgerente",
    email: "sglimpiezapr@munipuno.gob.pe",
    summary: "Barrido de calles, recolección y transporte de residuos, limpieza de barrios y fiscalización de puntos críticos.",
  },
  {
    name: "Subgerencia de Valorización y Disposición Final de Residuos Sólidos",
    head: "Ing. Heffner Ortiz Valenzuela",
    role: "Subgerente",
    email: "sgvalorizacionrs@munipuno.gob.pe",
    summary: "Planta de valorización y compostaje, acopio de orgánicos y reciclables, y operación del relleno sanitario de Itapalluni.",
  },
];

export interface WorkLine {
  id: string;
  title: string;
  unit: string;
  text: string;
  points: readonly string[];
  image: MediaKey;
  icon: IconName;
  link?: { href: string; label: string };
}

/** Lo que hace la gerencia, de la calle al relleno sanitario. */
export const WORK_LINES: readonly WorkLine[] = [
  {
    id: "limpieza",
    title: "Limpieza pública",
    unit: "Limpieza Pública y Recolección",
    text: "Cuadrillas de barrido mantienen limpias plazas, calles y parques. En el centro de la ciudad se hacen tres jornadas de limpieza al día.",
    points: ["Barrido de calles y plazas", "Jornadas en barrios alejados", "Limpieza de canales pluviales"],
    image: "limpiezaBarrio",
    icon: "home",
  },
  {
    id: "recoleccion",
    title: "Recolección y transporte",
    unit: "Limpieza Pública y Recolección",
    text: "Los camiones compactadores recorren la ciudad por rutas, sectores y turnos fijos, y llevan los residuos comunes a su disposición final.",
    points: ["29 rutas en 4 sectores", "Tres turnos al día", "Recolección selectiva de aprovechables"],
    image: "recoleccionSelectiva",
    icon: "truck",
    link: { href: "/rutas", label: "Rutas y horarios" },
  },
  {
    id: "valorizacion",
    title: "Valorización y compostaje",
    unit: "Valorización y Disposición Final",
    text: "Lo orgánico de mercados y colegios se convierte en compost en la planta municipal; lo reciclable vuelve a la cadena con recicladores formalizados.",
    points: ["Recojo diario de orgánicos en mercados", "Compost para áreas verdes y vecinos", "Trabajo con recicladores formalizados"],
    image: "compostajeMunicipal",
    icon: "sprout",
    link: { href: "/compostaje", label: "Programa de compostaje" },
  },
  {
    id: "disposicion",
    title: "Disposición final",
    unit: "Valorización y Disposición Final",
    text: "Lo que no puede aprovecharse va al relleno sanitario de Itapalluni, a unos 15 km de la ciudad, con tratamiento de lixiviados.",
    points: ["Relleno sanitario de Itapalluni", "Tratamiento de lixiviados", "Recuperación del ex botadero de Cancharani"],
    image: "compactador",
    icon: "recycle",
  },
  {
    id: "educacion",
    title: "Educación y fiscalización",
    unit: "Toda la gerencia",
    text: "Campañas en colegios e instituciones, el programa Sumaq Ayni y fiscalizadores ambientales que vigilan los puntos críticos de la ciudad.",
    points: ["Acopio de orgánicos en colegios", "Campañas Sumaq Ayni", "Control de puntos críticos"],
    image: "acopioColegio",
    icon: "users",
    link: { href: "/campanas", label: "Campañas Sumaq Ayni" },
  },
];

export interface Figure {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  source: keyof typeof OFFICE_SOURCES;
}

export const FIGURES: readonly Figure[] = [
  { value: 110, suffix: " t", label: "de residuos genera la ciudad cada día", source: "generacion" },
  { value: 60, suffix: " %", label: "de esos residuos se puede aprovechar", source: "generacion" },
  { value: 2, prefix: "+", suffix: " t", label: "de orgánicos se recogen al día en los mercados", source: "mercados" },
  { value: 3, label: "jornadas de limpieza al día en el centro", source: "centro" },
];

/** Lo que el vecino puede hacer en este portal: cada servicio vive en su propia sección. */
export const PORTAL_LINKS: readonly { href: string; title: string; text: string; icon: IconName; image: MediaKey }[] = [
  {
    href: "/rutas",
    title: "Rutas y horarios",
    text: "Por dónde y a qué hora pasa el camión por tu calle",
    icon: "route",
    image: "recoleccionSelectiva",
  },
  {
    href: "/segregacion",
    title: "Segregación",
    text: "Qué residuo va en cada uno de los cuatro colores",
    icon: "recycle",
    image: "contenedoresPlaza",
  },
  {
    href: "/compostaje",
    title: "Compostaje",
    text: "Inscríbete al programa municipal y recibe tu compostera",
    icon: "sprout",
    image: "compostMercado",
  },
  {
    href: "/campanas",
    title: "Sumaq Ayni",
    text: "Campañas, ecotrueques y voluntariado por el lago",
    icon: "heart",
    image: "recicladores",
  },
  {
    href: "/reporta",
    title: "Reporta a tu vecino",
    text: "Denuncia un punto crítico con foto y ubicación",
    icon: "camera",
    image: "puntoCritico",
  },
];
