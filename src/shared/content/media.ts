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
  // Notas de prensa de gob.pe/munipuno (2024–2025)
  limpiezaBarrio: {
    src: "/images/mpp/limpieza-barrio-manto.webp",
    alt: "Cuadrilla de limpieza pública retirando maleza y tierra de una vereda del barrio Manto",
    width: 897,
    height: 562,
  },
  acopioColegio: {
    src: "/images/mpp/acopio-organicos-colegio.webp",
    alt: "Estudiantes y personal municipal junto a los sacos de residuos orgánicos acopiados en el colegio El Buen Pastor",
    width: 880,
    height: 577,
  },
  fiscalizacion: {
    src: "/images/mpp/fiscalizacion-ambiental.webp",
    alt: "Fiscalizador ambiental de la Municipalidad orientando a una comerciante sobre el manejo de sus residuos",
    width: 656,
    height: 395,
  },
  // Paisajes del Titicaca
  titicacaBosque: {
    src: "/images/naturaleza/titicaca-bosque.webp",
    alt: "Arbustos y árboles verdes sobre la orilla del lago Titicaca, con totorales y cerros al fondo",
    width: 2400,
    height: 1603,
    credit: {
      author: "Ministerio de la Producción",
      source: "Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:Lago_Titicaca_en_la_region_Puno.jpg",
      license: "Dominio público",
    },
  },
  amanecerTotorales: {
    src: "/images/naturaleza/amanecer-totorales.webp",
    alt: "Amanecer naranja sobre los totorales del lago Titicaca cerca de Puno",
    width: 2400,
    height: 1162,
    credit: commons(
      "Diego Delso",
      "https://commons.wikimedia.org/wiki/File:Amanecer_en_el_lago_Titicaca,_Puno,_Per%C3%BA,_2015-08-01,_DD_01.JPG",
    ),
  },
  punoCiudadLago: {
    src: "/images/naturaleza/puno-ciudad-lago.webp",
    alt: "La ciudad de Puno con su bosque de eucaliptos y la bahía del Titicaca",
    width: 2400,
    height: 1207,
    credit: commons("Diego Delso", "https://commons.wikimedia.org/wiki/File:Vista_de_Puno_y_el_Titicaca,_Per%C3%BA,_2015-08-01,_DD_63.JPG"),
  },
  taquile: {
    src: "/images/naturaleza/taquile-lago.webp",
    alt: "Árboles sobre la ladera de la isla Taquile frente al azul del lago Titicaca",
    width: 2400,
    height: 1600,
    credit: {
      author: "Olivier Issaly",
      source: "Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:Isla_Taquile_Lago_Titicaca_(4462855661).jpg",
      license: "CC BY-SA 2.0",
    },
  },
} satisfies Record<string, Media>;

export type MediaKey = keyof typeof MEDIA;

export const CREDITED_MEDIA = Object.values(MEDIA).filter((m): m is Media & Required<Pick<Media, "credit">> => "credit" in m);
