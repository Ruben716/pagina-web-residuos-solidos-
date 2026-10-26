import { expect, type Page, test } from "@playwright/test";

/**
 * Panel de administración de punta a punta. Corre en serie y solo en escritorio: cambia la identidad y las
 * imágenes del sitio y lo deja todo como estaba al terminar. La base es PGlite en DATA_DIR (.data/e2e).
 */
// en serie y con más margen: cada paso pasa por la base de datos y por scrypt
test.describe.configure({ mode: "serial", timeout: 60_000 });
test.skip(({ isMobile }) => isMobile, "el panel se prueba una vez, en escritorio");

const ADMIN = { name: "Administración E2E", email: "admin.e2e@munipuno.gob.pe", password: "clave-e2e-del-panel" };
// PANEL_SETUP_TOKEN del webServer en playwright.config.ts
const SETUP_CODE = "codigo-e2e";

/** Entra como administrador; la primera vez crea la cuenta con el código de instalación. */
async function loginAsAdmin(page: Page) {
  await open(page, "/panel/ingresar");
  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toHaveText(/Configura el panel|Panel de administración/);
  if ((await heading.textContent())?.includes("Configura")) {
    await field(page, "Código de instalación").fill(SETUP_CODE);
    await field(page, "Nombre completo").fill(ADMIN.name);
    await field(page, "Correo institucional").fill(ADMIN.email);
    await field(page, "Nueva contraseña").fill(ADMIN.password);
    await field(page, "Repite la contraseña").fill(ADMIN.password);
    await page.getByRole("button", { name: "Crear administrador y entrar" }).click();
  } else {
    await login(page, ADMIN.email, ADMIN.password);
  }
  await expect(page).toHaveURL(/\/panel$/);
}

/**
 * Campo por su etiqueta exacta, solo entre los visibles: Next.js conserva ocultas las páginas ya visitadas
 * (React <Activity>) y sus formularios siguen en el DOM.
 */
const field = (page: Page, label: string) => page.getByLabel(label, { exact: true }).filter({ visible: true });

async function login(page: Page, email: string, password: string) {
  await field(page, "Correo").fill(email);
  await field(page, "Contraseña").fill(password);
  await page.getByRole("button", { name: "Ingresar" }).click();
}

/**
 * Abre una página del panel y espera a que el JavaScript esté listo (si no, React ignora lo que se escribe).
 * Al volver a abrir la página en la que ya se está, Chrome puede dejar colgadas las precargas canceladas de
 * la barra lateral y "networkidle" no llega nunca: para entonces la página ya está hidratada.
 */
async function open(page: Page, url: string) {
  await page.goto(url);
  await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {});
}

const cssVar = (page: Page, name: string) =>
  page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name);

test("sin sesión, el panel lleva al ingreso", async ({ page }) => {
  await open(page, "/panel/identidad");
  await expect(page).toHaveURL(/\/panel\/ingresar$/);
});

/** Vuelve el limón a su color de fábrica y lo publica (si una corrida anterior se cortó a medias). */
async function restoreBrote(page: Page) {
  await open(page, "/panel/identidad");
  const original = page.locator("#hex-brote").locator("xpath=..").getByRole("button", { name: "Original" });
  if (!(await original.isVisible())) return;
  await original.click();
  await page.getByRole("button", { name: "Publicar cambios" }).click();
  await expect(page.getByText("Publicado: el sitio ya muestra los cambios.")).toBeVisible();
}

test("un color publicado en el panel se ve en el sitio, y se restaura", async ({ page }) => {
  await loginAsAdmin(page);
  await restoreBrote(page);
  await open(page, "/panel/identidad");
  const publish = page.getByRole("button", { name: "Publicar cambios" });

  await page.locator("#hex-brote").fill("#a8e05f");
  await publish.click();
  await expect(page.getByText("Publicado: el sitio ya muestra los cambios.")).toBeVisible();
  await page.goto("/");
  expect(await cssVar(page, "--color-brote")).toBe("#a8e05f");

  await restoreBrote(page);
  await page.goto("/");
  expect(await cssVar(page, "--color-brote")).toBe("#9fd356");
});

test("una paleta que no se lee no se puede publicar", async ({ page }) => {
  await loginAsAdmin(page);
  await open(page, "/panel/identidad");
  await page.locator("#hex-puno").fill("#c8e6c9");
  await expect(page.getByText(/combinaci(ón|ones) no se lee/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Publicar cambios" })).toBeDisabled();
});

test("una imagen subida a un espacio aparece en el sitio, y se restaura", async ({ page }) => {
  await loginAsAdmin(page);
  await open(page, "/panel/imagenes");
  const slot = page.locator("#espacio-limpiezaBarrio");
  await slot.getByRole("button", { name: "Cambiar" }).click();
  await page.getByRole("tab", { name: "Subir una nueva" }).click();
  // PNG de 1×1 px: el servidor lo convierte a WebP
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");
  await page.locator('input[type="file"]').setInputFiles({ name: "prueba-e2e.png", mimeType: "image/png", buffer: png });
  await field(page, "Descripción de la imagen").fill("Imagen de prueba automática del panel");
  await page.getByRole("button", { name: "Subir y usar aquí" }).click();
  await expect(slot.getByText("Cambiada")).toBeVisible();

  await page.goto("/actualidad");
  await expect(page.locator("main img").first()).toHaveAttribute("src", /medios/);

  await open(page, "/panel/imagenes");
  await slot.getByRole("button", { name: "Restaurar original" }).click();
  await expect(slot.getByText("Cambiada")).toBeHidden();
});

/** Vuelve las preguntas frecuentes a sus datos de fábrica (si una corrida anterior se cortó a medias) y deja abierto su editor. */
async function restoreFaq(page: Page) {
  await open(page, "/panel/contenidos/faq");
  const restore = page.getByRole("button", { name: "Datos originales" });
  if (!(await restore.isVisible())) return;
  page.once("dialog", (d) => d.accept());
  await restore.click();
  await expect(page.getByText("Se restauraron los datos originales.")).toBeVisible();
}

test("una pregunta editada en Contenidos se ve en el sitio, y se restaura", async ({ page }) => {
  await loginAsAdmin(page);
  await restoreFaq(page);
  await field(page, "Pregunta").fill("¿Pregunta de prueba del panel?");
  await page.getByRole("button", { name: "Publicar cambios" }).click();
  await expect(page.getByText("Publicado: ya se ve en el sitio.")).toBeVisible();
  await expect(page.getByText("Todo publicado.")).toBeVisible();

  await page.goto("/preguntas");
  await expect(page.getByText("¿Pregunta de prueba del panel?")).toBeVisible();

  await restoreFaq(page);
  await page.goto("/preguntas");
  await expect(page.getByText("¿Pregunta de prueba del panel?")).toHaveCount(0);
});

test("una colección inválida no se publica y marca el campo", async ({ page }) => {
  await loginAsAdmin(page);
  await open(page, "/panel/contenidos/faq");
  await field(page, "Pregunta").fill("");
  await page.getByRole("button", { name: "Publicar cambios" }).click();
  await expect(page.getByText("Escribe la pregunta.")).toBeVisible();
  await expect(page.getByText("Revisa los elementos marcados")).toBeVisible();
});

test("dos personas editando la misma colección: la segunda no pisa a la primera", async ({ page, context }) => {
  await loginAsAdmin(page);
  await restoreFaq(page);
  // las dos pestañas cargan la misma versión
  const other = await context.newPage();
  await open(other, "/panel/contenidos/faq");
  await page.bringToFront();

  await field(page, "Pregunta").fill("¿Primera versión?");
  await page.getByRole("button", { name: "Publicar cambios" }).click();
  await expect(page.getByText("Publicado: ya se ve en el sitio.")).toBeVisible();

  await other.bringToFront();
  await field(other, "Pregunta").fill("¿Segunda versión?");
  await other.getByRole("button", { name: "Publicar cambios" }).click();
  await expect(other.getByText(/Alguien más guardó cambios/)).toBeVisible();

  await other.close();
  await restoreFaq(page);
});

test("un texto cambiado en Textos se ve en la portada, y se restaura", async ({ page }) => {
  const original = "La gerencia que mantiene limpia la ciudad de Puno";
  const title = page.locator("#t-gerencia-title");
  const publish = async () => {
    await page.getByRole("button", { name: "Publicar cambios" }).click();
    await expect(page.getByText("Publicado: ya se ve en el sitio.")).toBeVisible();
  };
  await loginAsAdmin(page);
  await open(page, "/panel/textos/inicio");
  // si una corrida anterior se cortó, se vuelve al original
  if ((await title.inputValue()) !== original) {
    await title.fill(original);
    await publish();
  }

  await title.fill("Título de prueba del panel");
  await publish();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 2, name: "Título de prueba del panel" })).toBeVisible();

  await open(page, "/panel/textos/inicio");
  await expect(page.locator("a[href='#s-gerencia']")).toContainText("1");
  await title
    .locator("xpath=ancestor::div[contains(@class,'rounded-xl')][1]")
    .getByRole("button", { name: "Restaurar el original" })
    .click();
  await expect(title).toHaveValue(original);
  await publish();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 2, name: original })).toBeVisible();
});

test("una nota en borrador no se ve; publicada sí; y se elimina", async ({ page, request }) => {
  const title = "Nota de prueba automática del panel";
  const slug = "nota-de-prueba-automatica-del-panel";
  await loginAsAdmin(page);

  // si una corrida anterior se cortó, se borra la nota que dejó
  await open(page, "/panel/noticias");
  const leftover = page.getByRole("link", { name: title });
  if (await leftover.count()) {
    await leftover.first().click();
    await page.waitForLoadState("networkidle");
    page.once("dialog", (d) => d.accept());
    await page.getByRole("button", { name: "Eliminar nota" }).click();
    await expect(page).toHaveURL(/eliminada/);
  }

  await open(page, "/panel/noticias/nueva");
  await field(page, "Titular").fill(title);
  await field(page, "Bajada").fill("Bajada de la nota de prueba.");
  await field(page, "Texto de la nota").fill(["Primer párrafo con **negrita**.", "## Un subtítulo", "- uno\n- dos"].join("\n\n"));
  await expect(field(page, "Dirección")).toHaveValue(slug);
  await page.getByRole("button", { name: "Crear borrador" }).click();
  await expect(page.getByText("Nota creada como borrador.")).toBeVisible();
  const editUrl = page.url().replace(/\?.*$/, "");
  expect((await request.get(`/noticias/${slug}`)).status()).toBe(404);

  // la página "Nueva nota" sigue oculta en el DOM (Activity): solo la visible
  await page
    .locator("label", { hasText: /^Publicada$/ })
    .filter({ visible: true })
    .click();
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByText("Guardada: ya se ve en el sitio.")).toBeVisible();

  await page.goto(`/noticias/${slug}`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(title);
  await expect(page.getByRole("heading", { level: 2, name: "Un subtítulo" })).toBeVisible();
  await expect(page.locator("article strong", { hasText: "negrita" })).toBeVisible();
  await page.goto("/noticias");
  await expect(page.getByRole("link", { name: new RegExp(title) }).first()).toBeVisible();

  await open(page, editUrl);
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Eliminar nota" }).click();
  await expect(page).toHaveURL(/\/panel\/noticias\?eliminada$/);
  expect((await request.get(`/noticias/${slug}`)).status()).toBe(404);
});

test("un editor entra con contraseña temporal, la cambia y no ve la identidad", async ({ page }) => {
  await loginAsAdmin(page);
  await open(page, "/panel/usuarios");
  const email = `editor.${Date.now()}@munipuno.gob.pe`;
  await field(page, "Nombre completo").fill("Editora de Prueba");
  await field(page, "Correo").fill(email);
  await page.getByRole("radio", { name: /Editor de contenidos/ }).check();
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  const temporary = (await page.locator("code").first().textContent())!.trim();
  expect(temporary).toMatch(/^\w{4}-\w{4}-\w{4}-\w{4}$/);

  await page.getByRole("button", { name: "Salir" }).click();
  await expect(page).toHaveURL(/ingresar$/);
  // la URL cambia antes de que termine la transición: se espera a la pantalla de ingreso
  await expect(page.getByRole("heading", { name: "Panel de administración" })).toBeVisible();
  await page.waitForLoadState("networkidle");
  await login(page, email, temporary);
  await expect(page).toHaveURL(/\/panel\/cuenta$/);
  await field(page, "Contraseña actual").fill(temporary);
  await field(page, "Nueva contraseña").fill("editora-clave-nueva-1");
  await field(page, "Repite la contraseña").fill("editora-clave-nueva-1");
  await page.getByRole("button", { name: "Cambiar contraseña" }).click();
  await expect(page).toHaveURL(/\/panel$/);

  const nav = page.getByRole("navigation", { name: "Panel" });
  await expect(nav.getByRole("link", { name: "Imágenes" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Contenidos" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Identidad y colores" })).toHaveCount(0);
  await open(page, "/panel/identidad");
  await expect(page).toHaveURL(/sin-permiso/);
});
