// Revisa el token de Facebook de .env.local y, si es de usuario, lo cambia por el de la página.
// Uso: npm run fb:token    El token nunca se imprime.
import { readFileSync, writeFileSync } from "node:fs";

const FILE = ".env.local";
const GRAPH = "https://graph.facebook.com/v26.0";
const KEY = /^\s*FACEBOOK_PAGE_TOKEN\s*=(.*)$/m;

const env = readFileSync(FILE, "utf8");
const token = env.match(KEY)?.[1].trim();
if (!token) {
  console.error(`No hay token en ${FILE}: pega el tuyo después de FACEBOOK_PAGE_TOKEN=`);
  process.exit(1);
}
const pageId = env.match(/^\s*FACEBOOK_PAGE_ID\s*=(.*)$/m)?.[1].trim();

const graph = async (path, tok) => {
  const res = await fetch(`${GRAPH}/${path}${path.includes("?") ? "&" : "?"}access_token=${encodeURIComponent(tok)}`);
  const body = await res.json();
  if (body.error) throw new Error(body.error.message);
  return body;
};
const when = (t) => (t ? new Date(t * 1000).toLocaleString("es-PE", { dateStyle: "long", timeStyle: "short" }) : "nunca");
const describe = async (tok) => (await graph(`debug_token?input_token=${encodeURIComponent(tok)}`, tok)).data;

try {
  let current = token;
  let info = await describe(current);
  console.log(`Token actual: ${info.type === "PAGE" ? "de página" : "de usuario"}, caduca ${when(info.expires_at)}.`);

  if (info.type === "USER") {
    const pages = (await graph("me/accounts?fields=id,name,access_token", token)).data;
    const page = pageId ? pages.find((p) => p.id === pageId) : pages[0];
    if (!page) throw new Error(`Esta cuenta no administra ${pageId ? `la página ${pageId}` : "ninguna página"}.`);
    if (!pageId && pages.length > 1)
      console.log(`La cuenta administra ${pages.length} páginas; se usa la primera. Fija FACEBOOK_PAGE_ID para elegir otra.`);
    current = page.access_token;
    writeFileSync(FILE, env.replace(KEY, `FACEBOOK_PAGE_TOKEN=${current}`));
    info = await describe(current);
    console.log(`Cambiado por el token de la página "${page.name}" (${page.id}), caduca ${when(info.expires_at)}.`);
    if (info.expires_at)
      console.log("Vence porque el token de usuario era corto: amplíalo en el Depurador de tokens y vuelve a correr esto.");
  }

  const posts = (await graph("me/posts?limit=5&fields=id", current)).data;
  console.log(`Publicaciones leídas: ${posts.length}. Acceso a datos hasta: ${when(info.data_access_expires_at)}`);
  console.log("Listo. Reinicia npm run dev (o vuelve a hacer npm run build) para que la web lo use.");
} catch (e) {
  console.error(`Facebook rechazó el token: ${e.message}`);
  console.error("Genera uno nuevo en el Explorador de la Graph API (ver docs/vault/Operacion/facebook-token.md).");
  process.exit(1);
}
