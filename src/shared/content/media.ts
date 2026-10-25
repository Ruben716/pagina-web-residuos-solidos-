export interface Media {
  src: string;
  alt: string;
  width: number;
  height: number;
  credit?: { author: string; source: string; url: string; license: string };
}

const commons = (author: string, url: string) => ({ author, source: "Wikimedia Commons", url, license: "CC BY-SA 4.0" });
const unsplash = (author: string, url: string) => ({ author, source: "Unsplash", url, license: "Licencia Unsplash" });

/** Todas las imágenes del sitio en un solo lugar: dimensiones, texto alternativo y crédito. */
export const MEDIA = {
  panorama: {
    src: "/images/puno/puno-titicaca-panorama.webp",
    alt: "Vista de la ciudad de Puno sobre la ladera con la bahía del lago Titicaca al fondo",
    width: 2400,
    height: 963,
    credit: commons(
      "Diego Delso",
      "https://commons.wikimedia.org/wiki/File:Vista_de_Puno_y_el_Titicaca,_Per%C3%BA,_2015-08-01,_DD_53-54_PAN.JPG",
    ),
  },
  plaza: {
    src: "/images/puno/puno-plaza-de-armas-catedral.webp",
    alt: "Plaza de Armas de Puno con su pileta y la Catedral",
    width: 2400,
    height: 1600,
    credit: commons("Draceane", "https://commons.wikimedia.org/wiki/File:Puno,_2023_(03).jpg"),
  },
  urosNiebla: {
    src: "/images/puno/uros-isla-totora-niebla.webp",
    alt: "Isla flotante de totora de los Uros en un día nublado sobre el lago",
    width: 2400,
    height: 1800,
    credit: unsplash("Sandro Ayalo", "https://unsplash.com/photos/2qdze9vwtl0"),
  },
  compostCajones: {
    src: "/images/puno/compost-cajones.webp",
    alt: "Composteras de madera con residuos orgánicos en descomposición",
    width: 2400,
    height: 1351,
    credit: unsplash("Frank Thiemonge", "https://unsplash.com/photos/GXEPGA3k7N0"),
  },
  compactador: {
    src: "/images/puno/camion-compactador-basura.webp",
    alt: "Camión compactador de residuos sólidos",
    width: 2400,
    height: 1600,
    credit: commons("Recologic", "https://commons.wikimedia.org/wiki/File:CamiondeBasura.jpg"),
  },
  botellas: {
    src: "/images/puno/botellas-plastico-acopio.webp",
    alt: "Botellas de plástico PET acumuladas en una jaula de acopio",
    width: 2400,
    height: 1800,
    credit: unsplash("Killari Hotaru", "https://unsplash.com/photos/aK859Jaekls"),
  },
  // Fotografías institucionales de la GGIRS
  recoleccionSelectiva: {
    src: "/images/flota-rutas.webp",
    alt: "Personal municipal recibiendo bolsas de residuos aprovechables en el camión de recolección selectiva",
    width: 2016,
    height: 1134,
  },
  compostajeMunicipal: {
    src: "/images/compostaje.webp",
    alt: "Trabajadora de la planta municipal volteando una pila de compost bajo invernadero",
    width: 2048,
    height: 1365,
  },
  puntoCritico: {
    src: "/images/reporte-vecino.webp",
    alt: "Bolsas de basura abandonadas en una vereda de Puno, un punto crítico",
    width: 1920,
    height: 1080,
  },
  contenedoresPlaza: {
    src: "/images/segregacion-puno.webp",
    alt: "Contenedores de cuatro colores y botella gigante Puno Limpio en la Plaza de Armas",
    width: 1376,
    height: 768,
  },
  contenedoresParque: {
    src: "/images/segregacion-tachos.webp",
    alt: "Estación de segregación con contenedores negro, marrón, verde y rojo en un parque de Puno",
    width: 1061,
    height: 647,
  },
  recicladores: {
    src: "/images/sumac-ayni.webp",
    alt: "Recicladora y reciclador de la asociación Los Ronderos del Sur junto a su mototaxi de acopio",
    width: 1875,
    height: 839,
  },
  // Notas de prensa de portal.munipuno.gob.pe (2025)
  cuadrillaLimpieza: {
    src: "/images/mpp/cuadrilla-limpieza.webp",
    alt: "Personal de limpieza pública de la Municipalidad barriendo y retirando ramas en una calle de Puno",
    width: 1800,
    height: 1201,
  },
  compostMercado: {
    src: "/images/mpp/compost-mercado-union.webp",
    alt: "Comerciante del mercado Unión y Dignidad muestra la bolsa de compost orgánico que entregó la Municipalidad",
    width: 1800,
    height: 1200,
  },
  equipoCampo: {
    src: "/images/mpp/equipo-ggirs-campo.webp",
    alt: "Equipo municipal durante una intervención en la urbanización La Rinconada Salcedo",
    width: 1800,
    height: 1200,
  },
  fachada: {
    src: "/images/mpp/fachada-municipal.webp",
    alt: "Fachada del Palacio Municipal de Puno en el jirón Deustua",
    width: 1280,
    height: 871,
  },
  sumaqAyni: {
    src: "/images/mpp/sumaq-ayni-banner.webp",
    alt: "Sumaq Ayni, bonito intercambio",
    width: 1800,
    height: 763,
  },
} satisfies Record<string, Media>;

export type MediaKey = keyof typeof MEDIA;

export const CREDITED_MEDIA = Object.values(MEDIA).filter((m): m is Media & Required<Pick<Media, "credit">> => "credit" in m);
