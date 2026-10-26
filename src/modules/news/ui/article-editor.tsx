"use client";

import Link from "next/link";
import { type ReactNode, useActionState, useRef, useState } from "react";
import { type ImageChoice, ImagePicker } from "@/modules/media/client";
import { cn } from "@/shared/lib/cn";
import { formatDate } from "@/shared/lib/format";
import { describedBy, Field } from "@/shared/ui/field";
import { FormAlert, SubmitButton } from "@/shared/ui/form-feedback";
import { Icon } from "@/shared/ui/icon";
import { type ArticleInput, CATEGORIES, readingMinutes, slugify, type Status, STATUSES } from "../domain/article";
import { type ArticleFormState, deleteArticle, saveArticle } from "../server/actions";
import { Markdown } from "./markdown";

type Errors = Record<string, string[] | undefined>;

/** Botones de formato: envuelven la selección o marcan el comienzo de cada línea. */
const TOOLS: readonly { label: string; icon?: ReactNode; wrap?: [string, string]; prefix?: string }[] = [
  { label: "Negrita", icon: <b>N</b>, wrap: ["**", "**"] },
  { label: "Cursiva", icon: <i className="font-serif">K</i>, wrap: ["*", "*"] },
  { label: "Subtítulo", icon: <span className="text-xs font-extrabold">H2</span>, prefix: "## " },
  { label: "Lista", icon: <Icon name="list" size={16} />, prefix: "- " },
  { label: "Lista numerada", icon: <span className="text-xs font-extrabold">1.</span>, prefix: "1. " },
  { label: "Cita", icon: <span className="font-serif text-lg leading-none">“</span>, prefix: "> " },
  { label: "Enlace", icon: <Icon name="link" size={16} />, wrap: ["[", "](https://)"] },
];

function BodyEditor({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string[] }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);

  const apply = (tool: (typeof TOOLS)[number]) => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b } = el;
    let next: string;
    let cursor: [number, number];
    if (tool.wrap) {
      const [open, close] = tool.wrap;
      const selected = value.slice(a, b) || tool.label.toLowerCase();
      next = value.slice(0, a) + open + selected + close + value.slice(b);
      cursor = [a + open.length, a + open.length + selected.length];
    } else {
      // de comienzo de la primera línea elegida a final de la última
      const start = value.lastIndexOf("\n", a - 1) + 1;
      const lines = value.slice(start, b).split("\n");
      const marked = lines.map((l, i) => (tool.prefix === "1. " ? `${i + 1}. ` : tool.prefix) + l).join("\n");
      next = value.slice(0, start) + marked + value.slice(b);
      cursor = [start, start + marked.length];
    }
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(...cursor);
    });
  };

  return (
    <Field
      id="a-body"
      label="Texto de la nota"
      error={error}
      hint="Deja una línea en blanco entre párrafos. El primer párrafo sale destacado."
    >
      <div className={cn("overflow-hidden rounded-xl border bg-white", error ? "border-peligroso" : "border-niebla")}>
        <div className="flex flex-wrap items-center gap-1 border-b border-bruma bg-cielo px-2 py-1.5">
          <div role="tablist" aria-label="Modo" className="mr-2 flex rounded-lg bg-white p-0.5 ring-1 ring-bruma">
            {[false, true].map((p) => (
              <button
                key={String(p)}
                type="button"
                role="tab"
                aria-selected={preview === p}
                onClick={() => setPreview(p)}
                className={cn(
                  "min-h-9 rounded-md px-3 text-sm font-bold",
                  preview === p ? "bg-puno text-white" : "text-puno hover:bg-cielo",
                )}
              >
                {p ? "Vista previa" : "Escribir"}
              </button>
            ))}
          </div>
          {!preview &&
            TOOLS.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => apply(t)}
                title={t.label}
                className="grid size-9 place-items-center rounded-md text-tinta hover:bg-white"
              >
                {t.icon}
                <span className="sr-only">{t.label}</span>
              </button>
            ))}
        </div>
        {preview ? (
          <div className="max-h-[70vh] min-h-[24rem] overflow-y-auto px-6 py-5">
            {value.trim() ? <Markdown source={value} /> : <p className="text-pizarra">Todavía no hay texto.</p>}
          </div>
        ) : (
          <textarea
            ref={ref}
            id="a-body"
            rows={18}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy("a-body", error, true)}
            className="block min-h-[24rem] w-full resize-y px-4 py-3 text-base leading-relaxed text-tinta outline-none"
          />
        )}
      </div>
    </Field>
  );
}

interface Props {
  /** null: nota nueva */
  id: string | null;
  initial: ArticleInput;
  version: number;
  updated: { at: string; by: string | null } | null;
  choices: readonly ImageChoice[];
  created?: boolean;
}

/** Editor de una nota de prensa: texto a la izquierda; estado, fecha, foto y fuente a la derecha. */
export function ArticleEditor({ id, initial, version: initialVersion, updated, choices, created }: Props) {
  const [article, setArticle] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [version, setVersion] = useState(initialVersion);
  // en una nota nueva la dirección sigue al titular hasta que se edita a mano
  const [slugTouched, setSlugTouched] = useState(Boolean(id));

  const [state, save] = useActionState<ArticleFormState, FormData>(
    async (prev, data) => {
      const result = await saveArticle(prev, data);
      if (result.status === "success") {
        setVersion(result.data.version);
        setSaved(JSON.parse(String(data.get("article"))) as ArticleInput);
      }
      return result;
    },
    { status: "idle" },
  );
  const [deleteState, remove] = useActionState(deleteArticle, { status: "idle" });

  const errors: Errors = state.status === "error" ? state.errors : {};
  const dirty = JSON.stringify(article) !== JSON.stringify(saved);
  const set = <K extends keyof ArticleInput>(key: K, value: ArticleInput[K]) =>
    setArticle((a) => ({ ...a, [key]: value, ...(key === "title" && !slugTouched && { slug: slugify(String(value)) }) }));
  const text = (
    key: "title" | "excerpt" | "sourceLabel" | "sourceUrl" | "slug" | "date",
    label: string,
    props: { hint?: string; optional?: boolean; type?: string; multiline?: boolean } = {},
  ) => {
    const fid = `a-${key}`;
    const common = {
      id: fid,
      className: "field",
      value: article[key],
      "aria-invalid": Boolean(errors[key]),
      "aria-describedby": describedBy(fid, errors[key], props.hint),
    };
    return (
      <Field id={fid} label={label} hint={props.hint} error={errors[key]} optional={props.optional}>
        {props.multiline ? (
          <textarea rows={3} {...common} onChange={(e) => set(key, e.target.value)} />
        ) : (
          <input
            type={props.type ?? "text"}
            {...common}
            onChange={(e) => {
              if (key === "slug") setSlugTouched(true);
              set(key, e.target.value);
            }}
          />
        )}
      </Field>
    );
  };

  return (
    <div className="space-y-6">
      {created && (
        <p role="status" className="flex items-center gap-2 rounded-xl bg-brote/15 px-4 py-3 font-semibold text-puno-800">
          <Icon name="checkCircle" size={18} />
          Nota creada{saved.status === "published" ? " y publicada" : " como borrador"}.
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section aria-label="Texto" className="space-y-5 rounded-2xl bg-white p-6 ring-1 ring-bruma md:p-8">
          {text("title", "Titular")}
          {text("excerpt", "Bajada", {
            multiline: true,
            hint: "Una o dos líneas que resumen la nota. Sale en las listas y al compartirla.",
          })}
          <BodyEditor value={article.body} onChange={(v) => set("body", v)} error={errors.body} />
          <p className="text-sm text-pizarra">Unos {readingMinutes(article.body)} min de lectura.</p>
        </section>

        <aside aria-label="Datos de la nota" className="space-y-5 self-start rounded-2xl bg-white p-6 ring-1 ring-bruma xl:sticky xl:top-6">
          <fieldset>
            <legend className="text-sm font-bold text-tinta">Estado</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(Object.keys(STATUSES) as Status[]).map((s) => (
                <label
                  key={s}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl font-bold ring-1",
                    article.status === s
                      ? s === "published"
                        ? "bg-puno text-white ring-puno"
                        : "bg-inti/40 text-noche ring-inti"
                      : "text-pizarra ring-bruma hover:bg-cielo",
                  )}
                >
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={article.status === s}
                    onChange={() => set("status", s)}
                    className="sr-only"
                  />
                  {STATUSES[s]}
                </label>
              ))}
            </div>
            <p className="mt-2 text-sm text-pizarra">{article.status === "published" ? "Se ve en el sitio." : "Solo se ve en el panel."}</p>
          </fieldset>

          {text("date", "Fecha", { type: "date" })}

          <Field id="a-category" label="Categoría" error={errors.category}>
            <select
              id="a-category"
              className="field"
              value={article.category}
              onChange={(e) => set("category", e.target.value as ArticleInput["category"])}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>

          <Field id="a-image" label="Foto principal" error={errors.image}>
            <ImagePicker
              id="a-image"
              value={article.image}
              choices={choices}
              onChange={(ref) => set("image", ref as ArticleInput["image"])}
              invalid={Boolean(errors.image)}
            />
          </Field>

          {text("slug", "Dirección", {
            hint:
              id && saved.status === "published"
                ? "Si la cambias, los enlaces ya compartidos dejan de funcionar."
                : `/noticias/${article.slug || "…"}`,
          })}

          <fieldset className="space-y-4 border-t border-bruma pt-5">
            <legend className="sr-only">Fuente</legend>
            {text("sourceLabel", "Fuente", { optional: true, hint: "Si la nota viene de un medio, p. ej. «Andina»." })}
            {text("sourceUrl", "Enlace de la fuente", { optional: true, type: "url" })}
          </fieldset>

          {id && (
            <form
              action={remove}
              onSubmit={(e) => {
                if (!window.confirm(`¿Eliminar «${saved.title}»? No se puede deshacer.`)) e.preventDefault();
              }}
              className="border-t border-bruma pt-5"
            >
              <input type="hidden" name="id" value={id} />
              <FormAlert state={deleteState} />
              <SubmitButton variant="outline" pendingLabel="Eliminando…" className="w-full text-peligroso">
                <Icon name="trash" size={16} />
                Eliminar nota
              </SubmitButton>
            </form>
          )}
        </aside>
      </div>

      <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/95 px-5 py-4 shadow-float ring-1 ring-bruma backdrop-blur">
        <div className="min-w-0 flex-1 space-y-1">
          <FormAlert state={state} success={state.status === "success" && state.data.message} />
          {state.status === "error" && Object.keys(errors).some((k) => k !== "_") && (
            <p className="text-sm font-semibold text-peligroso">Revisa los campos marcados.</p>
          )}
          <p className="text-sm text-pizarra">
            {dirty ? "Tienes cambios sin guardar." : id ? "Todo guardado." : "Nota nueva."}
            {updated &&
              ` Última edición: ${formatDate(updated.at, { dateStyle: "medium", timeStyle: "short" })}${updated.by ? ` por ${updated.by}` : ""}.`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {id && saved.status === "published" && (
            <Link
              href={`/noticias/${saved.slug}`}
              target="_blank"
              className="inline-flex min-h-12 items-center gap-2 rounded-xl px-4 font-bold text-puno hover:bg-cielo"
            >
              Ver en el sitio
              <Icon name="external" size={16} />
              <span className="sr-only">(abre en otra pestaña)</span>
            </Link>
          )}
          <form action={save}>
            {id && <input type="hidden" name="id" value={id} />}
            <input type="hidden" name="version" value={version} />
            <input type="hidden" name="article" value={JSON.stringify(article)} />
            <SubmitButton icon="check" disabled={!dirty} pendingLabel="Guardando…">
              {id ? "Guardar cambios" : article.status === "published" ? "Crear y publicar" : "Crear borrador"}
            </SubmitButton>
          </form>
        </div>
      </div>
    </div>
  );
}
