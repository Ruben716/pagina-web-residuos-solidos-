/**
 * Qué publicaciones de Facebook NO salen en la web. Se aplica en cada actualización (cada hora).
 */

/** Por enlace o por ID: pega el enlace del botón "Ver en Facebook" de la publicación. */
export const HIDDEN_POSTS: readonly string[] = [
  // "https://www.facebook.com/somospuno/posts/pfbid0abc...",
  // "2042635832435822_1246678060979690",
];

/** Si el texto de la publicación tiene este hashtag, no sale en la web. */
export const HIDE_TAG: string = "#noweb";

/** Hashtags de control que se borran del texto visible. */
export const CONTROL_TAGS: readonly string[] = ["#web"];

/** Solo publicaciones desde esta fecha (AAAA-MM-DD). Vacío = todas. */
export const SINCE: string = "";

/** Cuántas publicaciones se piden a Facebook. */
export const POST_LIMIT = 60;
