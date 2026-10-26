import { expect, test } from "@playwright/test";
import { checkPalette, contrastRatio } from "../src/modules/identity/domain/contrast";
import { DEFAULT_IDENTITY, DEFAULT_PALETTE, mergeIdentity, telHref } from "../src/modules/identity/domain/identity";

// Lógica pura de la identidad: no necesita navegador.
test.describe("identidad del sitio", () => {
  test("la paleta de fábrica cumple todas las reglas de contraste", () => {
    const failing = checkPalette(DEFAULT_PALETTE).filter((r) => !r.ok);
    expect(failing.map((r) => `${r.where}: ${r.ratio.toFixed(2)}`)).toEqual([]);
  });

  test("el contraste WCAG da 21:1 entre negro y blanco", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
  });

  test("una identidad guardada dañada vuelve a los valores de fábrica campo por campo", () => {
    const merged = mergeIdentity({
      institution: "Municipalidad de Prueba",
      office: "", // inválido: vacío
      palette: { puno: "#123456", brote: "verde" }, // brote inválido
      contact: { email: "no-es-correo", phone: "(051) 123456" },
      campoQueYaNoExiste: true,
    });
    expect(merged.institution).toBe("Municipalidad de Prueba");
    expect(merged.office).toBe(DEFAULT_IDENTITY.office);
    expect(merged.palette.puno).toBe("#123456");
    expect(merged.palette.brote).toBe(DEFAULT_PALETTE.brote);
    expect(merged.contact.email).toBe(DEFAULT_IDENTITY.contact.email);
    expect(merged.contact.phone).toBe("(051) 123456");
    expect(mergeIdentity(null)).toEqual(DEFAULT_IDENTITY);
  });

  test("el teléfono de Puno se convierte en enlace tel: internacional", () => {
    expect(telHref("(051) 601000")).toBe("tel:+5151601000");
    expect(telHref("")).toBe("");
  });
});
