"use client";

import Link from "next/link";
import { type CSSProperties, type ReactNode, useActionState, useMemo, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { describedBy, Field } from "@/shared/ui/field";
import { FormAlert, SubmitButton } from "@/shared/ui/form-feedback";
import { Icon } from "@/shared/ui/icon";
import { checkPalette } from "../domain/contrast";
import { DEFAULT_IDENTITY, FONTS, type Identity, PALETTE_GROUPS, THEME_TOKENS, type ThemeToken } from "../domain/identity";
import { type IdentityFormState, updateIdentity } from "../server/actions";

const HEX = /^#[0-9a-f]{6}$/;

const SECTIONS = [
  { id: "nombres", label: "Nombres" },
  { id: "contacto", label: "Contacto" },
  { id: "enlaces", label: "Redes y enlaces" },
  { id: "colores", label: "Colores" },
  { id: "tipografia", label: "Tipografía" },
] as const;

type TextPath =
  | "institution"
  | "office"
  | "officeShort"
  | "description"
  | `contact.${keyof Identity["contact"]}`
  | `social.${keyof Identity["social"]}`
  | `links.${keyof Identity["links"]}`;

const get = (identity: Identity, path: TextPath) => {
  const [a, b] = path.split(".") as [keyof Identity, string?];
  return (b ? (identity[a] as Record<string, string>)[b] : identity[a]) as string;
};

const set = (identity: Identity, path: TextPath, value: string): Identity => {
  const [a, b] = path.split(".") as [keyof Identity, string?];
  return b ? { ...identity, [a]: { ...(identity[a] as object), [b]: value } } : { ...identity, [a]: value };
};

function Section({ id, title, hint, children }: { id: string; title: string; hint?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className="scroll-mt-6 rounded-2xl bg-white p-6 ring-1 ring-bruma md:p-8">
      <h2 id={`${id}-titulo`} className="text-xl font-extrabold text-puno-800">
        {title}
      </h2>
      {hint && <p className="mt-1 text-sm text-pizarra">{hint}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

/**
 * Editor de la identidad del sitio. Todo se edita en el navegador con vista previa en vivo y se publica
 * de una vez; el servidor vuelve a validar formato y contraste antes de guardar.
 */
export function IdentityEditor({ initial }: { initial: Identity }) {
  const [identity, setIdentity] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [state, action] = useActionState(
    async (prev: IdentityFormState, data: FormData) => {
      const result = await updateIdentity(prev, data);
      if (result.status === "success") setSaved(JSON.parse(String(data.get("identity"))) as Identity);
      return result;
    },
    { status: "idle" } as IdentityFormState,
  );

  const contrast = useMemo(() => checkPalette(identity.palette), [identity.palette]);
  const failing = contrast.filter((r) => !r.ok);
  const dirty = JSON.stringify(identity) !== JSON.stringify(saved);
  const errors = state.status === "error" ? state.errors : {};

  const text = (path: TextPath, label: string, opts: { hint?: string; type?: string; area?: boolean; optional?: boolean } = {}) => {
    const id = `f-${path.replace(".", "-")}`;
    const error = errors[path];
    const common = {
      id,
      value: get(identity, path),
      onChange: (e: { target: { value: string } }) => setIdentity((cur) => set(cur, path, e.target.value)),
      className: "field",
      "aria-invalid": Boolean(error),
      "aria-describedby": describedBy(id, error, opts.hint),
    };
    return (
      <Field id={id} label={label} hint={opts.hint} error={error} optional={opts.optional}>
        {opts.area ? <textarea rows={3} {...common} /> : <input type={opts.type ?? "text"} {...common} />}
      </Field>
    );
  };

  const setColor = (token: ThemeToken, value: string) =>
    setIdentity((cur) => ({ ...cur, palette: { ...cur.palette, [token]: value.toLowerCase() } }));

  // variables CSS de la vista previa: los componentes de muestra usan las mismas utilidades que el sitio
  const preview = Object.fromEntries(THEME_TOKENS.map((t) => [`--color-${t.id}`, identity.palette[t.id]])) as CSSProperties;
  const font = FONTS.find((f) => f.id === identity.font)!;

  return (
    <form action={action} className="grid gap-8 xl:grid-cols-[11rem_minmax(0,1fr)]">
      <input type="hidden" name="identity" value={JSON.stringify(identity)} />

      <nav aria-label="Secciones de la identidad" className="hidden xl:block">
        <ul className="sticky top-6 space-y-1 text-sm font-semibold">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="block rounded-lg px-3 py-2 text-pizarra hover:bg-white hover:text-puno-800">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="min-w-0 space-y-6">
        <Section
          id="nombres"
          title="Nombres"
          hint="Aparecen en el encabezado, el pie de página, los títulos de la pestaña y al compartir en redes."
        >
          <div className="grid gap-5 md:grid-cols-2">
            {text("institution", "Institución")}
            {text("officeShort", "Sigla de la gerencia", { hint: "Corta, por ejemplo GGIRS." })}
            <div className="md:col-span-2">{text("office", "Nombre de la gerencia")}</div>
            <div className="md:col-span-2">
              {text("description", "Descripción del sitio", {
                area: true,
                hint: "La leen los buscadores y las redes al compartir un enlace.",
              })}
            </div>
          </div>
          <p className="mt-5 flex items-center gap-2 text-sm text-pizarra">
            <Icon name="info" size={16} className="text-puno" />
            El escudo se cambia en
            <Link href="/panel/imagenes#espacio-escudo" className="font-bold text-puno hover:underline">
              Imágenes → Escudo o logo
            </Link>
          </p>
        </Section>

        <Section id="contacto" title="Contacto y atención" hint="Barra superior, pie de página, organigrama y preguntas frecuentes.">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">{text("contact.address", "Dirección")}</div>
            {text("contact.phone", "Central telefónica", { hint: "Tal como se marca desde Puno, p. ej. (051) 601000." })}
            {text("contact.extension", "Anexo de la gerencia", { optional: true })}
            {text("contact.serenazgo", "Serenazgo", { optional: true, hint: "Si lo dejas vacío, no se muestra." })}
            {text("contact.email", "Correo", { type: "email" })}
            <div className="md:col-span-2">{text("contact.hours", "Horario de atención")}</div>
          </div>
        </Section>

        <Section
          id="enlaces"
          title="Redes sociales y enlaces"
          hint="Enlaces completos, que empiecen con https://. Una red vacía no se muestra."
        >
          <div className="grid gap-5 md:grid-cols-3">
            {text("social.facebook", "Facebook", { type: "url", optional: true })}
            {text("social.instagram", "Instagram", { type: "url", optional: true })}
            {text("social.tiktok", "TikTok", { type: "url", optional: true })}
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {text("links.portal", "Portal municipal", { type: "url" })}
            {text("links.transparency", "Portal de Transparencia", { type: "url" })}
            {text("links.tramite", "Mesa de partes virtual", { type: "url" })}
            {text("links.gobpe", "Página en gob.pe", { type: "url" })}
          </div>
        </Section>

        <Section
          id="colores"
          title="Colores"
          hint="Los cuatro colores de residuos (verde, marrón, negro y rojo) son norma técnica NTP 900.058:2019 y no se cambian aquí."
        >
          <div className="grid gap-8 2xl:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="space-y-8">
              {PALETTE_GROUPS.map((g) => (
                <fieldset key={g.id}>
                  <legend className="font-extrabold text-tinta">{g.label}</legend>
                  <p className="text-sm text-pizarra">{g.hint}</p>
                  <ul className="mt-3 divide-y divide-bruma border-y border-bruma">
                    {THEME_TOKENS.filter((t) => t.group === g.id).map((t) => {
                      const value = identity.palette[t.id];
                      const changed = value !== DEFAULT_IDENTITY.palette[t.id];
                      return (
                        <li key={t.id} className="flex flex-wrap items-center gap-3 py-2.5">
                          <input
                            type="color"
                            value={HEX.test(value) ? value : "#000000"}
                            onChange={(e) => setColor(t.id, e.target.value)}
                            aria-label={`${t.label}: elegir color`}
                            className="size-10 shrink-0 cursor-pointer rounded-lg border border-niebla bg-white p-0.5"
                          />
                          <label htmlFor={`hex-${t.id}`} className="min-w-0 flex-1 text-sm font-semibold text-tinta">
                            {t.label}
                          </label>
                          <input
                            id={`hex-${t.id}`}
                            value={value}
                            onChange={(e) => setColor(t.id, e.target.value)}
                            spellCheck={false}
                            maxLength={7}
                            aria-invalid={!HEX.test(value) || Boolean(errors[`palette.${t.id}`])}
                            className="field min-h-10 w-28 py-1.5 font-mono text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setColor(t.id, DEFAULT_IDENTITY.palette[t.id])}
                            disabled={!changed}
                            className="text-xs font-bold text-puno hover:underline disabled:invisible"
                          >
                            Original
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </fieldset>
              ))}
            </div>

            <div className="space-y-5 2xl:sticky 2xl:top-6 2xl:self-start">
              <div style={preview} aria-label="Vista previa" role="img" className="overflow-hidden rounded-2xl ring-1 ring-bruma">
                <div className="flex items-center justify-between bg-puno-800 px-4 py-2 text-xs font-semibold text-white">
                  <span>Barra superior</span>
                  <span className="text-celeste">● ● ●</span>
                </div>
                <div className="bg-white p-4">
                  <p className="text-xs font-extrabold tracking-[0.14em] text-puno uppercase">Antetítulo</p>
                  <p className="mt-1 text-lg font-extrabold text-puno-800">Título de sección</p>
                  <p className="text-sm text-pizarra">Texto secundario de ejemplo.</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-puno px-3 py-1.5 text-sm font-bold text-white">Botón</span>
                    <span className="rounded-full bg-celeste-200 px-2.5 py-0.5 text-xs font-extrabold text-puno-800">Etiqueta</span>
                    <span className="rounded-full bg-inti px-2.5 py-0.5 text-xs font-extrabold text-noche">Aviso</span>
                  </div>
                </div>
                <div className="bg-cielo p-4">
                  <p className="text-sm text-tinta">
                    Texto sobre fondo celeste con <span className="font-bold text-puno underline">un enlace</span>.
                  </p>
                </div>
                <div className="bg-noche p-4 text-white">
                  <p className="text-xs font-extrabold tracking-[0.14em] text-brote uppercase">Banda oscura</p>
                  <p className="text-sm">Texto blanco sobre verde noche.</p>
                </div>
                <div className="bg-brote p-3 text-sm font-bold text-noche">Franja limón</div>
              </div>

              <div aria-live="polite">
                <p className={cn("flex items-center gap-2 font-extrabold", failing.length ? "text-peligroso" : "text-exito")}>
                  <Icon name={failing.length ? "alert" : "checkCircle"} size={18} />
                  {failing.length
                    ? `${failing.length} ${failing.length === 1 ? "combinación no se lee" : "combinaciones no se leen"} bien`
                    : `Las ${contrast.length} combinaciones se leen bien (WCAG 2.2 AA)`}
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  {contrast
                    .toSorted((a, b) => Number(a.ok) - Number(b.ok))
                    .slice(0, failing.length ? undefined : 0)
                    .map((r) => (
                      <li
                        key={`${r.fg}-${r.bg}`}
                        className={cn("flex justify-between gap-3", r.ok ? "text-pizarra" : "font-semibold text-peligroso")}
                      >
                        <span>{r.where}</span>
                        <span className="shrink-0 tabular-nums">
                          {Number.isFinite(r.ratio) ? `${r.ratio.toFixed(1)}:1` : "color incompleto"} {r.ok ? "✓" : `(mín. ${r.min})`}
                        </span>
                      </li>
                    ))}
                </ul>
                {errors.palette && (
                  <ul className="mt-2 space-y-1 text-sm font-semibold text-peligroso" role="alert">
                    {errors.palette.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </Section>

        <Section id="tipografia" title="Tipografía" hint="Se aplica a todo el sitio.">
          <fieldset>
            <legend className="sr-only">Fuente del sitio</legend>
            <div className="grid gap-3 md:grid-cols-2">
              {FONTS.map((f) => (
                <label
                  key={f.id}
                  className="flex cursor-pointer gap-3 rounded-xl border border-niebla bg-white p-4 transition-colors has-checked:border-puno has-checked:bg-celeste-50"
                >
                  <input
                    type="radio"
                    name="font-choice"
                    value={f.id}
                    checked={identity.font === f.id}
                    onChange={() => setIdentity((cur) => ({ ...cur, font: f.id }))}
                    className="mt-1 size-4 accent-puno"
                  />
                  <span style={{ fontFamily: `var(${f.cssVar})` }}>
                    <span className="block text-xl font-extrabold text-puno-800">{f.label}</span>
                    <span className="block text-sm text-pizarra">{f.note}</span>
                    <span className="mt-1 block text-sm text-tinta">Separa tus residuos en cuatro colores · 0123456789</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <p className="mt-3 text-sm text-pizarra">
            Elegida: <strong className="text-tinta">{font.label}</strong>
          </p>
        </Section>

        {/* barra de guardado, siempre a la vista */}
        <div className="sticky bottom-0 z-10 -mx-2 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/95 px-5 py-4 shadow-float ring-1 ring-bruma backdrop-blur">
          <div className="min-w-0 flex-1">
            <FormAlert state={state} success="Publicado: el sitio ya muestra los cambios." />
            {state.status !== "error" && (
              <p className="text-sm font-semibold text-pizarra">{dirty ? "Tienes cambios sin publicar." : "Todo publicado."}</p>
            )}
            {state.status === "error" && Object.keys(errors).some((k) => k !== "_" && k !== "palette") && (
              <p className="text-sm font-semibold text-peligroso">Revisa los campos marcados en rojo.</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIdentity(saved)}
              disabled={!dirty}
              className="min-h-12 rounded-xl px-4 font-bold text-puno hover:bg-cielo disabled:invisible"
            >
              Descartar
            </button>
            <SubmitButton icon="check" disabled={!dirty || failing.length > 0} pendingLabel="Publicando…">
              Publicar cambios
            </SubmitButton>
          </div>
        </div>
      </div>
    </form>
  );
}
