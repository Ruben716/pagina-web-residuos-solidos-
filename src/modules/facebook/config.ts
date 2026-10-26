/**
 * Qué publicaciones de Facebook NO salen en la web. Son los valores de fábrica: desde el panel
 * (Contenidos → Filtro de Facebook) se cambian sin tocar código.
 */
export interface FeedFilters {
  /** por enlace o por ID: el enlace del botón "Ver en Facebook" de la publicación */
  hiddenPosts: string[];
  /** si el texto de la publicación tiene este hashtag, no sale en la web */
  hideTag: string;
  /** solo publicaciones desde esta fecha (AAAA-MM-DD); vacío = todas */
  since: string;
}

export const DEFAULT_FILTERS: FeedFilters = { hiddenPosts: [], hideTag: "#noweb", since: "" };

/** Hashtags de control que se borran del texto visible. */
export const CONTROL_TAGS: readonly string[] = ["#web"];

/** Cuántas publicaciones se piden a Facebook. */
export const POST_LIMIT = 60;
