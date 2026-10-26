import type { z } from "zod";

/**
 * Descripción de los campos de una colección para el editor genérico del panel. Son datos planos
 * (serializables): la página del panel se los pasa al editor, que dibuja el formulario.
 */

interface Base {
  name: string;
  label: string;
  hint?: string;
  optional?: boolean;
}

export type Field =
  | (Base & { type: "text" | "url" | "email" | "number" | "date" | "datetime" })
  | (Base & { type: "textarea"; rows?: number })
  | (Base & { type: "select"; options: readonly { value: string; label: string }[] })
  /** imagen: un espacio de fábrica (clave de MEDIA) o una de la biblioteca ("asset:<id>") */
  | (Base & { type: "image" })
  /** lista de textos, uno por línea */
  | (Base & { type: "lines" })
  /** objeto anidado (p. ej. el botón de una diapositiva) */
  | (Base & { type: "object"; fields: readonly Field[] })
  /** lista corta de objetos (p. ej. las tres cifras de una diapositiva) */
  | (Base & { type: "list"; fields: readonly Field[]; itemLabel: string; min?: number; max?: number });

/** Lo que el editor necesita saber de una colección. */
export interface CollectionView {
  key: string;
  title: string;
  description: string;
  /** "pregunta", "campaña"… para los botones ("Agregar pregunta") */
  itemName: string;
  /** campo que se muestra como título del elemento en la lista */
  titleField: string;
  subtitleField?: string;
  fields: readonly Field[];
  /** colección de tamaño fijo (p. ej. un solo ajuste): sin agregar ni quitar */
  fixed?: boolean;
  /** campo identificador que se genera solo al agregar (p. ej. "id" o "slug") */
  idField?: string;
  /** elemento nuevo con sus valores iniciales */
  blank: Record<string, unknown>;
  /** dónde se ve en el sitio */
  where: string;
}

/** Lee un documento guardado con el esquema del módulo; si falta o no cumple, devuelve los datos de fábrica. */
export function parseDoc<T>(raw: unknown, schema: z.ZodType<T>, fallback: T): T {
  if (raw == null) return fallback;
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    console.error("[content] documento inválido, se usan los datos de fábrica:", parsed.error.issues.slice(0, 3));
    return fallback;
  }
  return parsed.data;
}

/** Fecha y hora de Lima (UTC−5, sin horario de verano) ↔ valor de un <input type="datetime-local">. */
export const limaToLocalInput = (iso: string) => (iso ? iso.slice(0, 16) : "");
export const localInputToLima = (value: string) => (value ? `${value}:00-05:00` : "");
