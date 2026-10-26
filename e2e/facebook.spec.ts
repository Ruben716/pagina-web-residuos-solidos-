import { expect, test } from "@playwright/test";
import { toPost, toPosts } from "../src/modules/facebook/parse";

// La conversión de publicaciones no depende del navegador ni del token: se prueba con datos de la Graph API.
const raw = {
  id: "2042635832435822_111",
  created_time: "2026-10-20T15:30:00+0000",
  permalink_url: "https://www.facebook.com/2042635832435822/posts/111",
  message: "Operativo de limpieza en Laykakota #web\nRetiramos 3 toneladas de residuos.\nMás info: https://munipuno.gob.pe",
  attachments: {
    data: [
      {
        type: "album",
        subattachments: {
          data: [
            { media: { image: { src: "https://scontent.fbcdn.net/a.jpg", width: 720, height: 540 } } },
            { media: { image: { src: "https://scontent.fbcdn.net/b.jpg", width: 720, height: 960 } } },
          ],
        },
      },
    ],
  },
};

test.describe("publicaciones de Facebook", () => {
  test("separa titular y texto, quita #web y junta las fotos del álbum", () => {
    const post = toPost(raw)!;
    expect(post.headline).toBe("Operativo de limpieza en Laykakota");
    expect(post.body).toBe("Retiramos 3 toneladas de residuos.\nMás info: https://munipuno.gob.pe");
    expect(post.date).toBe("2026-10-20T15:30:00+00:00");
    expect(post.photos.map((p) => p.src)).toEqual(["https://scontent.fbcdn.net/a.jpg", "https://scontent.fbcdn.net/b.jpg"]);
    expect(post.video).toBe(false);
  });

  test("oculta las publicaciones con #noweb y las vacías", () => {
    const posts = toPosts([
      raw,
      { ...raw, id: "2", message: "Reunión interna #NoWeb" },
      { id: "3", created_time: "2026-10-01T10:00:00+0000" },
    ]);
    expect(posts.map((p) => p.id)).toEqual([raw.id]);
  });

  test("aplica el filtro del panel: enlaces ocultos, otro hashtag y fecha de inicio", () => {
    const data = [
      raw,
      { ...raw, id: "2_222", permalink_url: "https://www.facebook.com/munipuno/posts/pfbid0abc" },
      { ...raw, id: "3_333", message: "Interno #privado" },
      { ...raw, id: "4_444", created_time: "2025-01-01T10:00:00+0000" },
      { ...raw, id: "5_555", message: "Reunión #noweb" },
    ];
    const posts = toPosts(data, {
      hiddenPosts: ["https://www.facebook.com/munipuno/posts/pfbid0abc"],
      hideTag: "#privado",
      since: "2026-01-01",
    });
    expect(posts.map((p) => p.id)).toEqual([raw.id, "5_555"]);
  });

  test("un enlace compartido usa la copia de Facebook de la foto, no la del medio", () => {
    const post = toPost({
      id: "6",
      created_time: "2018-07-27T10:00:00+0000",
      message: "Nota de interés",
      full_picture: "https://external.ftcq3-1.fna.fbcdn.net/emg1/v/t13/foto.jpg",
      attachments: { data: [{ type: "share", media: { image: { src: "https://e.rpp-noticias.io/medium/foto.jpg" } } }] },
    })!;
    expect(post.photos).toEqual([{ src: "https://external.ftcq3-1.fna.fbcdn.net/emg1/v/t13/foto.jpg" }]);
  });

  test("una publicación de solo fotos se conserva, sin titular ni texto", () => {
    const post = toPost({ id: "5", created_time: "2026-10-01T10:00:00+0000", full_picture: "https://scontent.fbcdn.net/d.jpg" })!;
    expect(post.headline).toBeNull();
    expect(post.body).toBe("");
    expect(post.photos).toHaveLength(1);
  });

  test("un texto largo sin salto de línea no se vuelve titular y usa la foto principal", () => {
    const long = "a".repeat(200);
    const post = toPost({
      id: "4",
      created_time: "2026-10-01T10:00:00+0000",
      message: long,
      full_picture: "https://scontent.fbcdn.net/c.jpg",
    })!;
    expect(post.headline).toBeNull();
    expect(post.body).toBe(long);
    expect(post.photos).toEqual([{ src: "https://scontent.fbcdn.net/c.jpg" }]);
  });
});

test("la sección Actualidad muestra publicaciones o el aviso de Facebook", async ({ page }) => {
  await page.goto("/actualidad");
  const timeline = page.locator("article[id^='publicacion-']");
  const empty = page.getByRole("link", { name: /Ir a nuestra página de Facebook/ });
  await expect(timeline.first().or(empty)).toBeVisible();

  if (await timeline.count()) {
    const dialog = page.getByRole("dialog");
    // un clic antes de que hidrate la página no hace nada: se reintenta hasta que abra
    await expect(async () => {
      await timeline
        .first()
        .getByRole("button", { name: /Leer (completa|más)/ })
        .click();
      await expect(dialog).toBeVisible({ timeout: 1000 });
    }).toPass();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  }
});
