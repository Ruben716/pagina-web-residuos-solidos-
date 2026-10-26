"use client";

import { useActionState, useMemo, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { formatDate } from "@/shared/lib/format";
import { describedBy, Field } from "@/shared/ui/field";
import { FormAlert, SubmitButton } from "@/shared/ui/form-feedback";
import { Icon } from "@/shared/ui/icon";
import type { Entry } from "../domain/define";
import { type CopyFormState, saveCopy } from "../server/actions";

interface Props {
  page: string;
  sections: readonly { id: string; label: string; entries: readonly Entry[] }[];
  /** valores vigentes por clave plana */
  initial: Readonly<Record<string, string>>;
  version: number;
  updated: { at: string; by: string | null } | null;
}

const RICH_HINT = "Usa **así** para negrita. {gerencia} y {municipalidad} se reemplazan por los nombres de Identidad y colores.";

function TextField({ entry, value, error, onChange }: { entry: Entry; value: string; error?: string[]; onChange: (v: string) => void }) {
  const id = `t-${entry.key.replaceAll(".", "-")}`;
  const edited = value !== entry.value;
  const hint = [entry.hint, entry.rich && RICH_HINT].filter(Boolean).join(" ");
  const common = {
    id,
    value,
    onChange: (e: { target: { value: string } }) => onChange(e.target.value),
    className: "field",
    "aria-invalid": Boolean(error),
    "aria-describedby": describedBy(id, error, hint),
  };
  return (
    <div className={cn("rounded-xl p-4 transition-colors", edited ? "bg-celeste-50 ring-1 ring-celeste-200" : "")}>
      <Field id={id} label={entry.label} hint={hint || undefined} error={error}>
        {entry.long ? (
          <textarea rows={entry.lines ? 5 : Math.min(6, Math.ceil(value.length / 90) + 1)} {...common} />
        ) : (
          <input type="text" {...common} />
        )}
      </Field>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs">
        <span className={cn("tabular-nums", value.length > entry.max ? "font-bold text-peligroso" : "text-pizarra")}>
          {value.length}/{entry.max}
        </span>
        {edited && (
          <span className="flex items-center gap-3">
            <span className="font-bold text-puno">Cambiado</span>
            <button
              type="button"
              onClick={() => onChange(entry.value)}
              className="inline-flex items-center gap-1 font-bold text-puno hover:underline"
            >
              <Icon name="close" size={12} />
              Restaurar el original
            </button>
          </span>
        )}
      </div>
      {edited && <p className="mt-1 line-clamp-2 text-xs text-pizarra">Original: {entry.value.replaceAll("\n", " · ")}</p>}
    </div>
  );
}

/**
 * Editor de los textos de una página: índice de secciones a la izquierda y sus campos a la derecha.
 * Los cambiados se marcan y se pueden restaurar uno por uno; se publican todos juntos.
 */
export function CopyEditor({ page, sections, initial, version: initialVersion, updated }: Props) {
  const [values, setValues] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [version, setVersion] = useState(initialVersion);
  const [query, setQuery] = useState("");

  const [state, publish] = useActionState<CopyFormState, FormData>(
    async (prev, data) => {
      const result = await saveCopy(prev, data);
      if (result.status === "success") {
        setVersion(result.data.version);
        setSaved(JSON.parse(String(data.get("values"))) as Record<string, string>);
      }
      return result;
    },
    { status: "idle" },
  );

  const errors = state.status === "error" ? state.errors : {};
  const all = useMemo(() => sections.flatMap((s) => s.entries), [sections]);
  const dirty = all.some((e) => values[e.key] !== saved[e.key]);
  const changed = all.filter((e) => values[e.key] !== e.value).length;
  const q = query.trim().toLowerCase();
  const visible = sections
    .map((s) => ({ ...s, entries: s.entries.filter((e) => !q || `${s.label} ${e.label} ${values[e.key]}`.toLowerCase().includes(q)) }))
    .filter((s) => s.entries.length);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside aria-label="Secciones" className="self-start rounded-2xl bg-white p-4 ring-1 ring-bruma lg:sticky lg:top-6">
          <label className="block">
            <span className="sr-only">Buscar un texto</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar un texto…"
              className="field min-h-10 py-2"
            />
          </label>
          <ol className="mt-3 space-y-0.5 text-sm">
            {visible.map((s) => {
              const n = s.entries.filter((e) => values[e.key] !== e.value).length;
              const bad = s.entries.some((e) => errors[e.key]);
              return (
                <li key={s.id}>
                  <a
                    href={`#s-${s.id}`}
                    className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 font-semibold text-tinta hover:bg-cielo"
                  >
                    {s.label}
                    {bad ? (
                      <span className="rounded-full bg-peligroso px-1.5 text-xs font-bold text-white">!</span>
                    ) : (
                      n > 0 && <span className="rounded-full bg-puno px-1.5 text-xs font-bold text-white">{n}</span>
                    )}
                  </a>
                </li>
              );
            })}
          </ol>
          <p className="mt-3 border-t border-bruma pt-3 text-xs text-pizarra">
            {changed
              ? `${changed} ${changed === 1 ? "texto cambiado" : "textos cambiados"} respecto del original.`
              : "Todos los textos son los originales."}
          </p>
        </aside>

        <div className="space-y-6">
          {visible.map((s) => (
            <section
              key={s.id}
              id={`s-${s.id}`}
              aria-labelledby={`s-${s.id}-titulo`}
              className="scroll-mt-6 rounded-2xl bg-white p-4 ring-1 ring-bruma md:p-6"
            >
              <h2 id={`s-${s.id}-titulo`} className="px-4 pt-2 text-lg font-extrabold text-puno-800">
                {s.label}
              </h2>
              <div className="mt-2 grid gap-1">
                {s.entries.map((e) => (
                  <TextField
                    key={e.key}
                    entry={e}
                    value={values[e.key]}
                    error={errors[e.key]}
                    onChange={(v) => setValues((all) => ({ ...all, [e.key]: v }))}
                  />
                ))}
              </div>
            </section>
          ))}
          {!visible.length && (
            <p className="rounded-2xl bg-white p-6 text-pizarra ring-1 ring-bruma">Ningún texto coincide con «{query}».</p>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/95 px-5 py-4 shadow-float ring-1 ring-bruma backdrop-blur">
        <div className="min-w-0 flex-1 space-y-1">
          <FormAlert state={state} success={state.status === "success" && state.data.message} />
          {state.status === "error" && Object.keys(errors).some((k) => k !== "_") && (
            <p className="text-sm font-semibold text-peligroso">Revisa las secciones marcadas con «!».</p>
          )}
          <p className="text-sm text-pizarra">
            {dirty ? "Tienes cambios sin publicar." : "Todo publicado."}
            {updated &&
              ` Última publicación: ${formatDate(updated.at, { dateStyle: "medium", timeStyle: "short" })}${updated.by ? ` por ${updated.by}` : ""}.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setValues(saved)}
            disabled={!dirty}
            className="min-h-12 rounded-xl px-4 font-bold text-puno hover:bg-cielo disabled:invisible"
          >
            Descartar
          </button>
          <form action={publish}>
            <input type="hidden" name="page" value={page} />
            <input type="hidden" name="version" value={version} />
            <input type="hidden" name="values" value={JSON.stringify(values)} />
            <SubmitButton icon="check" disabled={!dirty} pendingLabel="Publicando…">
              Publicar cambios
            </SubmitButton>
          </form>
        </div>
      </div>
    </div>
  );
}
