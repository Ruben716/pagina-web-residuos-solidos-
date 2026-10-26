import type { SectionDef, TextDef } from "../domain/define";

/** Título de la pestaña y descripción para buscadores y redes. */
export const seo = (title: string, description: string) =>
  ({
    label: "Buscadores y pestaña",
    fields: {
      title: { label: "Título de la pestaña", value: title, max: 70, hint: "Sale en la pestaña del navegador y en Google." },
      description: {
        label: "Descripción",
        value: description,
        long: true,
        max: 200,
        hint: "El resumen que muestran Google y las redes al compartir.",
      },
    },
  }) satisfies SectionDef;

/** Cabecera de una página interna. */
export const hero = <const X extends Record<string, TextDef>>(texts: { eyebrow?: string; title: string; lede: string }, extra?: X) =>
  ({
    label: "Cabecera",
    fields: {
      ...(texts.eyebrow !== undefined && { eyebrow: { label: "Antetítulo", value: texts.eyebrow, max: 80 } }),
      title: { label: "Titular", value: texts.title, max: 120 },
      lede: { label: "Entradilla", value: texts.lede, long: true, max: 400 },
      ...extra,
    } as { eyebrow?: TextDef; title: TextDef; lede: TextDef } & X,
  }) satisfies SectionDef;

/** Encabezado de una sección: antetítulo, titular y, si tiene, entradilla. */
export const heading = <const X extends Record<string, TextDef>>(
  label: string,
  texts: { eyebrow: string; title: string; lede?: string },
  extra?: X,
) =>
  ({
    label,
    fields: {
      eyebrow: { label: "Antetítulo", value: texts.eyebrow, max: 80 },
      title: { label: "Titular", value: texts.title, max: 140 },
      ...(texts.lede !== undefined && { lede: { label: "Entradilla", value: texts.lede, long: true, max: 400 } }),
      ...extra,
    } as { eyebrow: TextDef; title: TextDef; lede?: TextDef } & X,
  }) satisfies SectionDef;

export const button = (value: string, label = "Botón"): TextDef => ({ label, value, max: 50 });
export const line = (label: string, value: string, max = 160): TextDef => ({ label, value, max });
export const para = (label: string, value: string, max = 900): TextDef => ({ label, value, long: true, max });
