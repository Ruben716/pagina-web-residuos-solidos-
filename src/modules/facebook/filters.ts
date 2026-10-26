import { z } from "zod";
import type { CollectionView } from "@/modules/content";
import { DEFAULT_FILTERS, type FeedFilters } from "./config";

/** Filtro de la sección Actualidad: qué publicaciones de Facebook no salen en la web. */

export const FEED_FILTERS_KEY = "facebook.filters";

export const feedFiltersSchema = z
  .array(
    z.object({
      hiddenPosts: z
        .array(z.string())
        .transform((a) => a.map((s) => s.trim()).filter(Boolean))
        .pipe(z.array(z.string().max(300, "Ese enlace es demasiado largo.")).max(500, "Máximo 500 publicaciones ocultas.")),
      hideTag: z
        .string()
        .trim()
        .regex(/^(#[\p{L}\p{N}_]{2,40})?$/u, "Escribe un hashtag sin espacios, p. ej. #noweb, o déjalo vacío."),
      since: z
        .string()
        .trim()
        .regex(/^(\d{4}-\d{2}-\d{2})?$/, "Elige una fecha o déjala vacía."),
    }),
  )
  .length(1) satisfies z.ZodType<FeedFilters[]>;

export const FEED_FILTERS_VIEW: CollectionView = {
  key: FEED_FILTERS_KEY,
  title: "Filtro de Facebook",
  description:
    "Qué publicaciones de la página de Facebook no se muestran en Actualidad. Facebook sigue mostrándolas: esto solo afecta a la web. Los cambios se ven al momento.",
  itemName: "filtro",
  titleField: "hideTag",
  fixed: true,
  where: "/actualidad",
  blank: {},
  fields: [
    {
      type: "lines",
      name: "hiddenPosts",
      label: "Publicaciones ocultas",
      optional: true,
      hint: "Una por línea: el enlace del botón «Ver en Facebook» de la publicación, o su número de ID.",
    },
    {
      type: "text",
      name: "hideTag",
      label: "Hashtag para ocultar",
      optional: true,
      hint: "Si una publicación lo lleva en el texto, no sale en la web. Vacío = ninguno.",
    },
    {
      type: "date",
      name: "since",
      label: "Mostrar desde",
      optional: true,
      hint: "Las publicaciones anteriores a esta fecha no salen. Vacío = todas.",
    },
  ],
};

export const FEED_FILTERS_DEFAULTS: FeedFilters[] = [DEFAULT_FILTERS];
