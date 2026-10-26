import { Fragment } from "react";

/**
 * Texto editable con **negrita** y marcas como {gerencia}, que se reemplazan por los nombres vigentes
 * (Identidad y colores). Sin HTML: lo demás se muestra tal cual.
 */
export function Rich({ text, vars = {}, strong }: { text: string; vars?: Readonly<Record<string, string>>; strong?: string }) {
  const filled = text.replace(/\{(\w+)\}/g, (whole, name: string) => vars[name] ?? whole);
  return filled.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 ? (
      <strong key={i} className={strong}>
        {part}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
