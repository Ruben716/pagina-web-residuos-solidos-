/**
 * Formato simple para el cuerpo de las notas, pensado para quien redacta en el panel:
 *
 *   ## Subtítulo          ### Subtítulo menor
 *   **negrita**  *cursiva*  [texto del enlace](https://…)
 *   - lista               1. lista numerada
 *   > cita
 *
 * Un párrafo por bloque, separados por una línea en blanco. Se convierte en datos (no en HTML), así que
 * no hay forma de colar etiquetas ni scripts: lo que no se reconoce se muestra como texto.
 */

export type Inline =
  { type: "text"; text: string } | { type: "strong" | "em"; children: Inline[] } | { type: "link"; href: string; children: Inline[] };

export type Block = { type: "p" | "h2" | "h3" | "quote"; children: Inline[] } | { type: "ul" | "ol"; items: Inline[][] };

/** Solo enlaces web y direcciones del propio sitio. */
export const safeHref = (href: string) => (/^(https?:\/\/|\/(?!\/)|mailto:)/i.test(href) ? href : null);

const INLINE = /\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_|\[([^\]]+)\]\(([^)\s]+)\)/;

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  let rest = text;
  while (rest) {
    const m = INLINE.exec(rest);
    if (!m) {
      out.push({ type: "text", text: rest });
      break;
    }
    if (m.index) out.push({ type: "text", text: rest.slice(0, m.index) });
    const [whole, strong, em1, em2, label, href] = m;
    if (strong !== undefined) out.push({ type: "strong", children: parseInline(strong) });
    else if (em1 !== undefined || em2 !== undefined) out.push({ type: "em", children: parseInline(em1 ?? em2) });
    else {
      const safe = safeHref(href);
      out.push(safe ? { type: "link", href: safe, children: parseInline(label) } : { type: "text", text: whole });
    }
    rest = rest.slice(m.index + whole.length);
  }
  return out;
}

const LIST = { ul: /^[-*]\s+/, ol: /^\d+[.)]\s+/ } as const;

export function parseMarkdown(source: string): Block[] {
  const blocks: Block[] = [];
  for (const chunk of source.replace(/\r\n?/g, "\n").split(/\n\s*\n/)) {
    const lines = chunk
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (!lines.length) continue;
    const first = lines[0];

    const list = (Object.keys(LIST) as (keyof typeof LIST)[]).find((k) => lines.every((l) => LIST[k].test(l)));
    if (list) blocks.push({ type: list, items: lines.map((l) => parseInline(l.replace(LIST[list], ""))) });
    else if (/^###\s/.test(first)) blocks.push({ type: "h3", children: parseInline(lines.join(" ").replace(/^###\s+/, "")) });
    else if (/^##?\s/.test(first)) blocks.push({ type: "h2", children: parseInline(lines.join(" ").replace(/^##?\s+/, "")) });
    else if (lines.every((l) => l.startsWith(">")))
      blocks.push({ type: "quote", children: parseInline(lines.map((l) => l.replace(/^>\s?/, "")).join(" ")) });
    else blocks.push({ type: "p", children: parseInline(lines.join(" ")) });
  }
  return blocks;
}
