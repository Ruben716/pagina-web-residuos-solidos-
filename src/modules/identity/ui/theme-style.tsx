import { DEFAULT_PALETTE, FONTS, type Identity, THEME_TOKENS } from "../domain/identity";

/** Declaraciones CSS de la paleta y la fuente: solo lo que difiere de los valores de fábrica de globals.css. */
export function themeDeclarations(identity: Pick<Identity, "palette" | "font">) {
  const decl = THEME_TOKENS.filter((t) => identity.palette[t.id] !== DEFAULT_PALETTE[t.id]).map(
    (t) => `--color-${t.id}:${identity.palette[t.id]}`,
  );
  const font = FONTS.find((f) => f.id === identity.font);
  if (font && font.id !== "kumbh") decl.push(`--font-sans:var(${font.cssVar}),ui-sans-serif,system-ui,sans-serif`);
  return decl;
}

/**
 * Aplica la identidad del panel sobre los tokens de Tailwind (todas las utilidades leen var(--color-*)),
 * así un cambio de color llega a todo el sitio sin recompilar. Los valores ya vienen validados
 * (hex y fuente de una lista cerrada), por eso es seguro escribirlos en un <style>.
 */
export function ThemeStyle({ identity }: { identity: Identity }) {
  const decl = themeDeclarations(identity);
  if (!decl.length) return null;
  return <style id="identidad">{`:root{${decl.join(";")}}`}</style>;
}
