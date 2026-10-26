import { Fragment } from "react";
import { cn } from "@/shared/lib/cn";
import { type Inline, parseMarkdown } from "../domain/markdown";

function Inlines({ nodes }: { nodes: Inline[] }) {
  return nodes.map((n, i) => {
    switch (n.type) {
      case "text":
        return <Fragment key={i}>{n.text}</Fragment>;
      case "strong":
        return (
          <strong key={i} className="font-bold">
            <Inlines nodes={n.children} />
          </strong>
        );
      case "em":
        return (
          <em key={i}>
            <Inlines nodes={n.children} />
          </em>
        );
      case "link": {
        const external = /^https?:/.test(n.href);
        return (
          <a
            key={i}
            href={n.href}
            {...(external && { target: "_blank", rel: "noreferrer" })}
            className="font-semibold text-puno underline underline-offset-4"
          >
            <Inlines nodes={n.children} />
            {external && <span className="sr-only"> (se abre en otra pestaña)</span>}
          </a>
        );
      }
    }
  });
}

/**
 * Cuerpo de una nota. El primer párrafo sale destacado como entradilla. Sirve igual en el sitio y en
 * la vista previa del panel: no usa estado ni HTML crudo.
 */
export function Markdown({ source, className }: { source: string; className?: string }) {
  const blocks = parseMarkdown(source);
  const lead = blocks[0]?.type === "p" ? 0 : -1;
  return (
    <div className={cn("space-y-6 text-lg leading-[1.8] text-tinta", className)}>
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return (
              <h2 key={i} className="pt-4 text-2xl leading-tight font-extrabold text-puno-800">
                <Inlines nodes={b.children} />
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="pt-2 text-xl leading-snug font-extrabold text-puno-800">
                <Inlines nodes={b.children} />
              </h3>
            );
          case "quote":
            return (
              <blockquote key={i} className="border-l-4 border-brote pl-5 text-xl leading-relaxed text-puno-800 italic">
                <Inlines nodes={b.children} />
              </blockquote>
            );
          case "ul":
          case "ol": {
            const List = b.type;
            return (
              <List key={i} className={cn("space-y-2 pl-6", b.type === "ul" ? "list-disc" : "list-decimal", "marker:text-puno")}>
                {b.items.map((item, k) => (
                  <li key={k}>
                    <Inlines nodes={item} />
                  </li>
                ))}
              </List>
            );
          }
          default:
            return (
              <p key={i} className={i === lead ? "text-xl leading-[1.65] font-semibold text-puno-800" : undefined}>
                <Inlines nodes={b.children} />
              </p>
            );
        }
      })}
    </div>
  );
}
