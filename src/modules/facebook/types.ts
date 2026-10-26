export interface PostPhoto {
  src: string;
  width?: number;
  height?: number;
}

/** Publicación de la página de Facebook, ya limpia y lista para mostrar. */
export interface FacebookPost {
  id: string;
  /** fecha y hora ISO */
  date: string;
  /** primera línea del texto, cuando es corta: funciona como titular */
  headline: string | null;
  body: string;
  /** enlace a la publicación en Facebook */
  link: string;
  photos: PostPhoto[];
  video: boolean;
}

/** Datos públicos de la página para la tarjeta "Síguenos". */
export interface FacebookPage {
  name: string;
  followers: number | null;
  picture: string | null;
  /** enlace público de la página */
  link: string | null;
}

export interface FacebookFeed {
  /** "sin-configurar": falta el token; "error": Facebook no respondió y no hay copia anterior */
  status: "ok" | "sin-configurar" | "error";
  posts: FacebookPost[];
  page: FacebookPage | null;
  pageUrl: string;
}
