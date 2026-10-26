import { expect, test } from "@playwright/test";
import { slugify } from "../src/modules/news/domain/article";
import { parseMarkdown } from "../src/modules/news/domain/markdown";

// El formato de las notas no depende del navegador: se prueba directo sobre el analizador.
test.describe("formato de las notas de prensa", () => {
  test("reconoce párrafos, subtítulos, listas, citas y énfasis", () => {
    const blocks = parseMarkdown("Primero con **negrita** y *cursiva*.\n\n## Subtítulo\n\n- uno\n- dos\n\n1. a\n2. b\n\n> cita");
    expect(blocks.map((b) => b.type)).toEqual(["p", "h2", "ul", "ol", "quote"]);
    expect(blocks[0]).toEqual({
      type: "p",
      children: [
        { type: "text", text: "Primero con " },
        { type: "strong", children: [{ type: "text", text: "negrita" }] },
        { type: "text", text: " y " },
        { type: "em", children: [{ type: "text", text: "cursiva" }] },
        { type: "text", text: "." },
      ],
    });
  });

  test("solo acepta enlaces web o del sitio; el resto queda como texto", () => {
    const [p] = parseMarkdown("[sitio](/rutas) [web](https://munipuno.gob.pe) [mal](javascript:alert(1)) <script>x</script>");
    expect(p.type === "p" && p.children).toEqual([
      { type: "link", href: "/rutas", children: [{ type: "text", text: "sitio" }] },
      { type: "text", text: " " },
      { type: "link", href: "https://munipuno.gob.pe", children: [{ type: "text", text: "web" }] },
      { type: "text", text: " " },
      { type: "text", text: "[mal](javascript:alert(1)" },
      { type: "text", text: ") <script>x</script>" },
    ]);
  });

  test("la dirección sale del titular sin tildes ni signos", () => {
    expect(slugify("¿Cómo separar tus residuos en Puno? Guía 2026")).toBe("como-separar-tus-residuos-en-puno-guia-2026");
  });
});
