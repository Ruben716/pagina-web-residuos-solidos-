import { expect, test } from "@playwright/test";
import { checkValue, entries, unflatten } from "../src/modules/copy/domain/define";
import { COPY_PAGES } from "../src/modules/copy/domain/registry";

// El registro de textos no depende del navegador: se prueba directo.
test.describe("textos editables por página", () => {
  test("cada texto de fábrica cumple su propio límite y las claves no se repiten", () => {
    for (const [key, page] of Object.entries(COPY_PAGES)) {
      const all = entries(page);
      expect(new Set(all.map((e) => e.key)).size, key).toBe(all.length);
      for (const e of all) expect(checkValue(e, e.value), `${key}: ${e.key}`).toBe(e.value);
    }
  });

  test("hay entre 150 y 250 textos editables", () => {
    const total = Object.values(COPY_PAGES).reduce((n, p) => n + entries(p).length, 0);
    expect(total).toBeGreaterThanOrEqual(150);
    expect(total).toBeLessThanOrEqual(250);
  });

  test("un texto vacío o demasiado largo no se acepta; las líneas se limpian", () => {
    const [title] = entries(COPY_PAGES.rutas).filter((e) => e.key === "hero.title");
    expect(checkValue(title, "   ")).toBeNull();
    expect(checkValue(title, "x".repeat(title.max + 1))).toBeNull();
    expect(checkValue(title, "  Rutas\ny horarios ")).toBe("Rutas y horarios");
    const [included] = entries(COPY_PAGES.compostaje).filter((e) => e.key === "inscripcion.included");
    expect(checkValue(included, "uno\n\n  dos  \n")).toBe("uno\ndos");
  });

  test("las listas vuelven con su forma: t.consejos.items[i].title", () => {
    const values = Object.fromEntries(entries(COPY_PAGES.rutas).map((e) => [e.key, e.value]));
    values["consejos.items.1.title"] = "Cambiado";
    const t = unflatten(COPY_PAGES.rutas, values);
    expect(t.consejos.items).toHaveLength(3);
    expect(t.consejos.items[1].title).toBe("Cambiado");
    expect(t.hero.title).toBe("Rutas y horarios de recolección");
  });
});
