/**
 * Textos editables de una página: secciones con campos sueltos (antetítulo, titular, entradilla…) y,
 * si hace falta, una lista de tamaño fijo (los pasos, las recomendaciones…). El valor de fábrica vive
 * en el código; el panel solo guarda los que se cambian. Código puro: lo usan servidor y cliente.
 */

export interface TextDef {
  label: string;
  /** valor de fábrica */
  value: string;
  /** párrafo (área de texto) en lugar de una línea */
  long?: boolean;
  /** admite **negrita** y las marcas {gerencia} y {municipalidad} */
  rich?: boolean;
  /** un elemento por línea */
  lines?: boolean;
  max?: number;
  hint?: string;
}

export interface ListDef {
  itemLabel: string;
  titleLabel?: string;
  textLabel?: string;
  items: readonly { title: string; text: string }[];
}

export interface SectionDef {
  label: string;
  fields: Readonly<Record<string, TextDef>>;
  list?: ListDef;
}

export interface PageDef {
  label: string;
  path: string;
  sections: Readonly<Record<string, SectionDef>>;
}

export const definePage = <const P extends PageDef>(page: P) => page;

export interface CopyItem {
  title: string;
  text: string;
}

/** Textos de una página ya resueltos, con la forma de su definición: t.hero.title, t.pasos.items… */
export type CopyOf<P extends PageDef> = {
  [S in keyof P["sections"]]: { [F in keyof P["sections"][S]["fields"]]: string } & (P["sections"][S]["list"] extends ListDef
    ? { items: CopyItem[] }
    : unknown);
};

/** Un texto editable con su clave plana ("hero.title", "pasos.items.0.text"), tal como lo guarda el panel. */
export interface Entry {
  key: string;
  section: string;
  label: string;
  value: string;
  long: boolean;
  rich: boolean;
  lines: boolean;
  max: number;
  hint?: string;
}

const ITEM_KEY = /^items\.(\d+)\.(title|text)$/;

export function entries(page: PageDef): Entry[] {
  return Object.entries(page.sections).flatMap(([section, def]) => [
    ...Object.entries(def.fields).map(([name, f]) => ({
      key: `${section}.${name}`,
      section,
      label: f.label,
      value: f.value,
      long: Boolean(f.long || f.lines),
      rich: Boolean(f.rich),
      lines: Boolean(f.lines),
      max: f.max ?? (f.long || f.lines ? 900 : 160),
      hint: f.hint,
    })),
    ...(def.list?.items ?? []).flatMap((item, i) => {
      const list = def.list!;
      const n = `${list.itemLabel} ${i + 1}`;
      return [
        {
          key: `${section}.items.${i}.title`,
          section,
          label: `${n}: ${list.titleLabel ?? "título"}`,
          value: item.title,
          long: false,
          rich: false,
          lines: false,
          max: 120,
        },
        {
          key: `${section}.items.${i}.text`,
          section,
          label: `${n}: ${list.textLabel ?? "texto"}`,
          value: item.text,
          long: true,
          rich: false,
          lines: false,
          max: 400,
        },
      ];
    }),
  ]);
}

/** El valor guardado si sirve (texto, sin pasarse del largo); si no, null y se usa el de fábrica. */
export function checkValue(entry: Entry, raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const value = entry.lines
    ? raw
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .join("\n")
    : raw.trim().replace(/\s*\n\s*/g, entry.long ? "\n" : " ");
  return value && value.length <= entry.max ? value : null;
}

/** De claves planas a la forma de la página. */
export function unflatten<P extends PageDef>(page: P, values: Readonly<Record<string, string>>): CopyOf<P> {
  const out: Record<string, Record<string, unknown>> = {};
  for (const [section, def] of Object.entries(page.sections)) {
    const s: Record<string, unknown> = {};
    for (const name of Object.keys(def.fields)) s[name] = values[`${section}.${name}`];
    if (def.list) {
      const items = def.list.items.map(() => ({ title: "", text: "" }));
      for (const [key, value] of Object.entries(values)) {
        if (!key.startsWith(`${section}.`)) continue;
        const m = ITEM_KEY.exec(key.slice(section.length + 1));
        if (m && items[Number(m[1])]) items[Number(m[1])][m[2] as "title" | "text"] = value;
      }
      s.items = items;
    }
    out[section] = s;
  }
  return out as CopyOf<P>;
}
