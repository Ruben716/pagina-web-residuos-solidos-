import { expect, test } from "@playwright/test";
import { PAGES } from "./pages";

for (const page of PAGES) {
  test(`${page.path} carga sin errores`, async ({ page: p }) => {
    const errors: string[] = [];
    p.on("pageerror", (e) => errors.push(e.message));
    p.on("console", (m) => m.type() === "error" && !m.text().includes("tile") && errors.push(m.text()));

    const res = await p.goto(page.path);
    expect(res?.status()).toBe(200);
    await expect(p.getByRole("heading", { level: 1 })).toContainText(page.title);
    await expect(p.getByRole("link", { name: "Saltar al contenido" })).toBeAttached();
    await expect(p.locator("main#contenido")).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("una ruta inexistente devuelve 404", async ({ page }) => {
  const res = await page.goto("/rutas/ruta-99");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("no está en ninguna ruta");
});

test("la navegación principal lleva a cada sección", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) {
    await page.getByRole("button", { name: "Abrir menú" }).click();
    await page
      .getByRole("navigation", { name: "Menú móvil" })
      .getByRole("link", { name: /Segregación/ })
      .click();
  } else {
    await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Segregación" }).click();
  }
  await expect(page).toHaveURL(/\/segregacion$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Separa tus residuos");
});
