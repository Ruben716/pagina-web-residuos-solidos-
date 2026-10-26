import { INICIO } from "../pages/inicio";
import { ACTUALIDAD, COMPOSTAJE, CREDITOS, NOTICIAS } from "../pages/otras";
import { CAMPANAS, PREGUNTAS, REPORTA, SEGUIMIENTO } from "../pages/participa";
import { RUTAS } from "../pages/rutas";
import { SEGREGACION } from "../pages/segregacion";

/** Páginas con textos editables, en el orden del menú del sitio. La clave es la de la dirección del panel. */
export const COPY_PAGES = {
  inicio: INICIO,
  rutas: RUTAS,
  segregacion: SEGREGACION,
  compostaje: COMPOSTAJE,
  campanas: CAMPANAS,
  actualidad: ACTUALIDAD,
  noticias: NOTICIAS,
  preguntas: PREGUNTAS,
  reporta: REPORTA,
  seguimiento: SEGUIMIENTO,
  creditos: CREDITOS,
} as const;

export type CopyPageKey = keyof typeof COPY_PAGES;

export const isCopyPage = (key: string): key is CopyPageKey => Object.hasOwn(COPY_PAGES, key);

/** Clave del documento con los textos cambiados de una página (en content_docs). */
export const copyDocKey = (page: CopyPageKey) => `copy.${page}`;
