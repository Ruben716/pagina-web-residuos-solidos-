import type { MediaKey } from "@/shared/content/media";

/**
 * Espacios de imagen del sitio: cada clave del registro MEDIA es un espacio que el panel puede reemplazar.
 * Al cambiar uno, cambia en todos los lugares donde aparece.
 */

export const SLOT_GROUPS = [
  "Identidad",
  "Portada",
  "Segregación",
  "Compostaje",
  "Campañas Sumaq Ayni",
  "Rutas, reportes y noticias",
  "Paisajes de Puno",
] as const;

export type SlotGroup = (typeof SLOT_GROUPS)[number];

interface SlotInfo {
  label: string;
  group: SlotGroup;
  where: string;
  /** proporción de recorte sugerida, solo informativa */
  shape: "horizontal" | "vertical" | "logo";
}

export const SLOTS: Record<MediaKey, SlotInfo> = {
  escudo: { label: "Escudo o logo", group: "Identidad", where: "Encabezado, pie de página y página 404", shape: "logo" },

  titicacaBosque: { label: "Carrusel · diapositiva 1", group: "Portada", where: "Portada, carrusel principal", shape: "horizontal" },
  cuadrillaLimpieza: {
    label: "Carrusel · limpieza pública",
    group: "Portada",
    where: "Carrusel, Notas de prensa, seguimiento de reportes",
    shape: "horizontal",
  },
  compostajeMunicipal: {
    label: "Planta municipal de compost",
    group: "Portada",
    where: "Carrusel, página Compostaje, líneas de trabajo",
    shape: "horizontal",
  },
  punoCiudadLago: { label: "Carrusel · Puno y el lago", group: "Portada", where: "Carrusel principal", shape: "horizontal" },
  equipoCampo: { label: "Equipo en campo", group: "Portada", where: "«Quiénes somos», Notas de prensa, campañas", shape: "vertical" },
  acopioColegio: {
    label: "Acopio de orgánicos en colegio",
    group: "Portada",
    where: "«Quiénes somos», programa de la bolsa verde",
    shape: "horizontal",
  },
  amanecerTotorales: { label: "Fondo de las cifras", group: "Portada", where: "Banda «Puno en cifras» de la portada", shape: "horizontal" },
  limpiezaBarrio: {
    label: "Limpieza de barrio",
    group: "Portada",
    where: "Cabecera de Actualidad, líneas de trabajo",
    shape: "horizontal",
  },
  fiscalizacion: { label: "Fiscalización ambiental", group: "Portada", where: "Líneas de trabajo de la gerencia", shape: "horizontal" },

  recoleccionSelectiva: {
    label: "Camión de recolección selectiva",
    group: "Segregación",
    where: "Fondo de Segregación, Rutas, Notas de prensa, imagen al compartir",
    shape: "horizontal",
  },
  contenedoresParque: {
    label: "Estación Punto Limpio",
    group: "Segregación",
    where: "Índice de servicios, nota del código de colores",
    shape: "horizontal",
  },
  binAprovechables: {
    label: "Bolsa verde · aprovechables",
    group: "Segregación",
    where: "Banda verde de Segregación",
    shape: "horizontal",
  },
  binOrganicos: { label: "Bolsa marrón · orgánicos", group: "Segregación", where: "Banda marrón de Segregación", shape: "vertical" },
  binNoAprovechables: {
    label: "Bolsa negra · no aprovechables",
    group: "Segregación",
    where: "Banda negra de Segregación",
    shape: "horizontal",
  },
  binPeligrosos: { label: "Bolsa roja · peligrosos", group: "Segregación", where: "Banda roja de Segregación", shape: "horizontal" },
  botellas: { label: "Botellas PET en acopio", group: "Segregación", where: "Campañas, notas y rutas", shape: "horizontal" },
  recicladores: { label: "Recicladores formalizados", group: "Segregación", where: "Portada, Segregación, Campañas", shape: "horizontal" },

  compostCajones: { label: "Composteras de madera", group: "Compostaje", where: "Compostaje y campañas", shape: "horizontal" },
  compostMercado: { label: "Compost en el mercado", group: "Compostaje", where: "Compostaje, Notas de prensa", shape: "horizontal" },

  sumaqAyni: { label: "Banner Sumaq Ayni", group: "Campañas Sumaq Ayni", where: "Cabecera de Campañas", shape: "horizontal" },
  urosNiebla: { label: "Uros en la niebla", group: "Campañas Sumaq Ayni", where: "Campañas", shape: "horizontal" },

  puntoCritico: {
    label: "Punto crítico de basura",
    group: "Rutas, reportes y noticias",
    where: "Reporta, notas de prensa",
    shape: "horizontal",
  },
  compactador: { label: "Camión compactador", group: "Rutas, reportes y noticias", where: "Rutas y notas de prensa", shape: "horizontal" },
  fachada: { label: "Palacio Municipal", group: "Rutas, reportes y noticias", where: "Notas de prensa", shape: "horizontal" },
  panorama: { label: "Panorámica de Puno", group: "Paisajes de Puno", where: "Notas de prensa", shape: "horizontal" },
  plaza: { label: "Plaza de Armas", group: "Paisajes de Puno", where: "Preguntas frecuentes, campañas", shape: "horizontal" },
  taquile: { label: "Isla Taquile", group: "Paisajes de Puno", where: "Disponible", shape: "horizontal" },
};

export const isSlot = (key: string): key is MediaKey => key in SLOTS;
