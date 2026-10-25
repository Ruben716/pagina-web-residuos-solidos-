import { expect, test } from "@playwright/test";

test.describe("Rutas", () => {
  test("el buscador de rutas encuentra la ruta de una calle y abre su ficha", async ({ page }) => {
    await page.goto("/rutas");
    const search = page.getByRole("searchbox", { name: /Busca tu calle/ });
    const routes = page.getByRole("list", { name: "Rutas de recolección" });
    await expect(async () => {
      await search.fill("flora");
      await search.fill("floral");
      await expect(routes.getByRole("button", { name: /Av\. Floral \(Tramo Puerto\)/ })).toBeVisible({ timeout: 1500 });
    }).toPass();
    await routes.getByRole("button", { name: /Av\. Floral \(Tramo Puerto\)/ }).click();
    await expect(page.getByRole("heading", { name: /Barrio Porteño/ })).toBeVisible();
    await expect(page.locator(".leaflet-container")).toBeVisible();
    await page.getByRole("link", { name: "Ver ficha completa" }).click();
    await expect(page).toHaveURL(/\/rutas\/ruta-05$/);
  });

  test("el planificador abre la ruta de la URL, vuelve a la lista y filtra por sector", async ({ page }) => {
    await page.goto("/rutas?ruta=ruta-09");
    await expect(page.getByRole("heading", { name: /Ciudad Universitaria UNA Puno/ })).toBeVisible();
    await page.getByRole("button", { name: "Todas las rutas" }).click();
    await page.getByRole("button", { name: "Sur", exact: true }).click();
    const routes = page.getByRole("list", { name: "Rutas de recolección" });
    await expect(routes.getByRole("button", { name: /^Ruta 16/ })).toBeVisible();
    await expect(routes.getByRole("button", { name: /^Ruta 01/ })).toHaveCount(0);
  });

  test("el buscador entiende abreviaturas, signos y errores de tipeo", async ({ page }) => {
    const routes = page.getByRole("list", { name: "Rutas de recolección" });
    for (const [query, expected] of [
      ["jiron lima", /^Ruta 01/],
      ["laycacota", /^Ruta 02/],
      ["huajsapta", /^Ruta 04/],
      ["ruta 5", /^Ruta 05/],
    ] as const) {
      await page.goto(`/rutas?q=${encodeURIComponent(query)}`);
      await expect(routes.getByRole("button").first()).toHaveAccessibleName(expected);
    }
  });

  test("una búsqueda sin resultados explica qué hacer", async ({ page }) => {
    await page.goto("/rutas?q=calle que no existe");
    await expect(page.getByText(/No encontramos “calle que no existe”/)).toBeVisible();
    await page.getByRole("button", { name: "Borrar búsqueda" }).click();
    await expect(page.getByRole("list", { name: "Rutas de recolección" }).getByRole("button")).toHaveCount(29);
  });

  test("el cuadro de horarios lista las rutas por sector", async ({ page }) => {
    await page.goto("/rutas#horarios");
    // el mapa de la misma página carga Leaflet y mosaicos: se espera a que termine antes de navegar
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("table", { name: "Rutas del sector 4" })).toBeVisible();
    await page
      .getByRole("table", { name: "Rutas del sector 1" })
      .getByRole("link", { name: /Laykakota y Arco Deustua/ })
      .click();
    await expect(page).toHaveURL(/ruta-02$/);
  });

  test("la ficha de ruta muestra horario, calles y mapa", async ({ page }) => {
    await page.goto("/rutas/ruta-01");
    await expect(page.getByText("5:00 a. m. a 8:30 a. m.").first()).toBeVisible();
    await expect(page.getByText("Jr. Lima (Peatonal)")).toBeVisible();
    await expect(page.locator(".leaflet-container")).toBeVisible();
    await page.getByRole("link", { name: /Ruta siguiente/ }).click();
    await expect(page).toHaveURL(/ruta-02$/);
  });
});

test.describe("Segregación", () => {
  test("el índice dice en qué color va un objeto", async ({ page }) => {
    await page.goto("/segregacion");
    await page.getByRole("searchbox", { name: /Escribe un objeto/ }).fill("pilas");
    await page.getByRole("button", { name: "Pilas y baterías" }).click();
    await expect(page.getByText("Pilas y baterías va en la bolsa")).toBeVisible();
    await expect(page.getByText("Rojo", { exact: true }).last()).toBeVisible();
  });

  test("el buscador de objetos tolera errores y nombres comunes", async ({ page }) => {
    await page.goto("/segregacion");
    const search = page.getByRole("searchbox", { name: /Escribe un objeto/ });
    await search.fill("botella platico");
    await expect(page.getByRole("button", { name: "Botellas de plástico PET" })).toBeVisible();
    await search.fill("caja de leche");
    await expect(page.getByRole("button", { name: "Tetrapak" })).toBeVisible();
  });
});

test.describe("Compostaje", () => {
  test("la calculadora responde al número de personas", async ({ page }) => {
    await page.goto("/compostaje");
    const slider = page.getByRole("slider", { name: "Personas en tu hogar" });
    const bags = page.getByText("Bolsas de basura menos al año").locator("..");
    // reintenta hasta que React haya hidratado el control (cambia el valor para que haya evento)
    await expect(async () => {
      await slider.fill("2");
      await slider.fill("1");
      await expect(bags).toContainText(/año\s*27\s*bolsas/, { timeout: 1500 });
    }).toPass();
    await slider.fill("10");
    await expect(bags).toContainText(/año\s*270\s*bolsas/);
  });

  test("la inscripción valida y confirma", async ({ page }) => {
    await page.goto("/compostaje#inscripcion");
    await page.getByLabel("Nombre y apellido").fill("Rosa Mamani");
    await page.getByLabel("Celular o WhatsApp").fill("951234567");
    await page.getByLabel("Dirección").fill("Jr. Arequipa 345, Puno");
    await page.getByText("Azotea o balcón").click();
    await page.getByLabel(/Me comprometo/).check();
    await page.getByRole("button", { name: "Inscribirme al programa" }).click();
    const confirmation = page.getByRole("status").filter({ hasText: "Listo" });
    await expect(confirmation).toContainText("Listo, Rosa");
    await expect(confirmation).toContainText(/COMP-[A-F0-9]{6}/);
  });
});

test.describe("Reporta a tu vecino", () => {
  test("flujo completo: reporte anónimo, código y seguimiento", async ({ page }) => {
    await page.goto("/reporta");
    await page.getByText("Punto crítico o botadero clandestino").click();
    await page.getByLabel("Barrio o sector").selectOption("Laykakota");
    await page.getByLabel("Dirección o referencia").fill("Jr. Tarapacá con Jr. Oquendo");
    await page.getByRole("button", { name: "Continuar" }).click();

    await page.getByLabel("¿Qué está pasando?").fill("Hay bolsas acumuladas desde hace tres días en la esquina.");
    await page.getByRole("button", { name: "Continuar" }).click();

    await page.getByText("Enviar como reporte anónimo").click();
    await page.getByRole("button", { name: "Enviar reporte" }).click();

    const status = page.getByRole("status");
    await expect(status).toContainText("Reporte enviado");
    const ticket = (await status.getByText(/^MPP-\d{4}-[A-Z2-9]{4}$/).textContent())!.trim();

    await page.getByRole("link", { name: "Ver seguimiento" }).click();
    await expect(page).toHaveURL(new RegExp(`codigo=${ticket}`));
    await expect(page.getByRole("heading", { name: ticket })).toBeVisible();
    await expect(page.getByText("(etapa actual)")).toBeAttached();
  });

  test("no deja avanzar sin los datos del paso 1", async ({ page }) => {
    await page.goto("/reporta");
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page.getByRole("group", { name: /Paso 1/ })).toBeVisible();
  });

  test("un código mal escrito muestra cómo corregirlo", async ({ page }) => {
    await page.goto("/reporta/seguimiento?codigo=abc");
    await expect(page.getByRole("heading", { name: /no tiene el formato correcto/ })).toBeVisible();
  });
});

test.describe("Sumaq Ayni", () => {
  test("inscripción a una campaña desde la lista", async ({ page }) => {
    await page.goto("/campanas");
    await page.getByRole("button", { name: "Unirme" }).first().click();
    await page.getByLabel("Nombre").first().fill("Juan Quispe");
    await page.getByLabel("Celular").first().fill("987654321");
    await page.getByRole("button", { name: "Confirmar inscripción" }).click();
    await expect(page.getByRole("status")).toContainText("Gracias, Juan");
  });
});
