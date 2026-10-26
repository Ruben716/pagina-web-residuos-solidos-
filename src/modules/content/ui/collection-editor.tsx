"use client";

import { useActionState, useMemo, useState } from "react";
import { type ImageChoice, ImagePicker } from "@/modules/media/client";
import { cn } from "@/shared/lib/cn";
import { formatDate } from "@/shared/lib/format";
import type { FormState } from "@/shared/server/form";
import { describedBy, Field as FieldShell } from "@/shared/ui/field";
import { FormAlert, SubmitButton } from "@/shared/ui/form-feedback";
import { Icon } from "@/shared/ui/icon";
import { type CollectionView, type Field, limaToLocalInput, localInputToLima } from "../domain/fields";

type Item = Record<string, unknown>;
/** Al restaurar, `items` trae los datos de fábrica para mostrarlos sin recargar. */
export type CollectionFormState = FormState<{ version: number; message: string; items?: Item[] }>;
type Action = (prev: CollectionFormState, data: FormData) => Promise<CollectionFormState>;
type Errors = Record<string, string[] | undefined>;

const newId = () => crypto.randomUUID().slice(0, 8);
const text = (v: unknown) => (v == null ? "" : String(v));

// ---------- un campo ----------

interface FieldProps {
  field: Field;
  value: unknown;
  onChange: (value: unknown) => void;
  /** ruta del campo para los errores: "3.question", "0.stats.1.value"… */
  path: string;
  errors: Errors;
  choices: readonly ImageChoice[];
}

function FieldInput({ field, value, onChange, path, errors, choices }: FieldProps) {
  const id = `c-${path.replaceAll(".", "-")}`;
  const error = errors[path];
  const common = {
    id,
    className: "field",
    "aria-invalid": Boolean(error),
    "aria-describedby": describedBy(id, error, field.hint),
  };

  if (field.type === "object") {
    const obj = (value as Item | undefined) ?? undefined;
    return (
      <fieldset className="rounded-xl border border-bruma p-4">
        <legend className="px-1 text-sm font-bold text-tinta">{field.label}</legend>
        {field.optional && (
          <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-pizarra">
            <input
              type="checkbox"
              checked={Boolean(obj)}
              onChange={(e) => onChange(e.target.checked ? {} : undefined)}
              className="size-4 accent-puno"
            />
            Incluir
          </label>
        )}
        {obj && (
          <div className="grid gap-4 md:grid-cols-2">
            {field.fields.map((f) => (
              <FieldInput
                key={f.name}
                field={f}
                value={obj[f.name]}
                onChange={(v) => onChange({ ...obj, [f.name]: v })}
                path={`${path}.${f.name}`}
                errors={errors}
                choices={choices}
              />
            ))}
          </div>
        )}
      </fieldset>
    );
  }

  if (field.type === "list") {
    const rows = (value as Item[] | undefined) ?? [];
    const set = (i: number, row: Item) => onChange(rows.map((r, k) => (k === i ? row : r)));
    return (
      <fieldset className="rounded-xl border border-bruma p-4">
        <legend className="px-1 text-sm font-bold text-tinta">{field.label}</legend>
        {field.hint && <p className="mb-3 text-sm text-pizarra">{field.hint}</p>}
        <ol className="space-y-3">
          {rows.map((row, i) => (
            <li key={i} className="grid items-end gap-3 rounded-lg bg-cielo p-3 md:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))_auto]">
              {field.fields.map((f) => (
                <FieldInput
                  key={f.name}
                  field={f}
                  value={row[f.name]}
                  onChange={(v) => set(i, { ...row, [f.name]: v })}
                  path={`${path}.${i}.${f.name}`}
                  errors={errors}
                  choices={choices}
                />
              ))}
              <button
                type="button"
                onClick={() => onChange(rows.filter((_, k) => k !== i))}
                disabled={rows.length <= (field.min ?? 0)}
                className="grid size-11 place-items-center rounded-xl text-peligroso hover:bg-white disabled:invisible"
              >
                <Icon name="trash" size={18} />
                <span className="sr-only">
                  Quitar {field.itemLabel} {i + 1}
                </span>
              </button>
            </li>
          ))}
        </ol>
        {rows.length < (field.max ?? Infinity) && (
          <button
            type="button"
            onClick={() => onChange([...rows, {}])}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-puno hover:underline"
          >
            <Icon name="plus" size={16} />
            Agregar {field.itemLabel}
          </button>
        )}
      </fieldset>
    );
  }

  let control;
  switch (field.type) {
    case "textarea":
      control = <textarea rows={field.rows ?? 4} value={text(value)} onChange={(e) => onChange(e.target.value)} {...common} />;
      break;
    case "lines":
      control = (
        <textarea
          rows={4}
          value={((value as string[] | undefined) ?? []).join("\n")}
          onChange={(e) => onChange(e.target.value.split("\n"))}
          {...common}
        />
      );
      break;
    case "select":
      control = (
        <select value={text(value)} onChange={(e) => onChange(e.target.value)} {...common}>
          {field.optional && <option value="">—</option>}
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    case "number":
      control = (
        <input
          type="number"
          step="any"
          value={text(value)}
          onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
          {...common}
        />
      );
      break;
    case "datetime":
      control = (
        <input
          type="datetime-local"
          value={limaToLocalInput(text(value))}
          onChange={(e) => onChange(localInputToLima(e.target.value))}
          {...common}
        />
      );
      break;
    case "image":
      control = <ImagePicker id={id} value={text(value)} choices={choices} onChange={onChange} invalid={Boolean(error)} />;
      break;
    default:
      control = <input type={field.type} value={text(value)} onChange={(e) => onChange(e.target.value)} {...common} />;
  }
  return (
    <FieldShell
      id={id}
      label={field.label}
      hint={field.hint}
      error={error}
      optional={field.optional}
      className={field.type === "textarea" || field.type === "lines" ? "md:col-span-2" : undefined}
    >
      {control}
    </FieldShell>
  );
}

// ---------- el editor ----------

interface Props {
  view: CollectionView;
  initial: { items: Item[]; version: number; updatedAt: string | null; updatedBy: string | null };
  choices: readonly ImageChoice[];
  save: Action;
  reset: Action;
}

/**
 * Editor de una colección del sitio: lista a la izquierda (buscar, ordenar, agregar, quitar) y el
 * formulario del elemento elegido a la derecha. Se publica la colección entera de una vez; el servidor
 * la valida con el esquema del módulo y rechaza la publicación si alguien guardó en el medio.
 */
export function CollectionEditor({ view, initial, choices, save, reset }: Props) {
  const [items, setItems] = useState<Item[]>(initial.items);
  const [saved, setSaved] = useState(initial.items);
  const [version, setVersion] = useState(initial.version);
  const [selected, setSelected] = useState(0);
  const [query, setQuery] = useState("");

  const [state, publish] = useActionState<CollectionFormState, FormData>(
    async (prev, data) => {
      const result = await save(prev, data);
      if (result.status === "success") {
        setVersion(result.data.version);
        // el servidor devuelve la colección ya normalizada (sin espacios sobrantes ni líneas vacías)
        const published = result.data.items ?? (JSON.parse(String(data.get("items"))) as Item[]);
        setItems(published);
        setSaved(published);
      }
      return result;
    },
    { status: "idle" },
  );
  const [resetState, restore] = useActionState<CollectionFormState, FormData>(
    async (prev, data) => {
      const result = await reset(prev, data);
      if (result.status === "success") {
        setVersion(result.data.version);
        if (result.data.items) {
          setItems(result.data.items);
          setSaved(result.data.items);
          setSelected(0);
        }
      }
      return result;
    },
    { status: "idle" },
  );

  const errors: Errors = state.status === "error" ? state.errors : {};
  const dirty = JSON.stringify(items) !== JSON.stringify(saved);
  const current = items[selected];
  const title = (it: Item, i: number) => text(it[view.titleField]) || `${view.itemName[0].toUpperCase()}${view.itemName.slice(1)} ${i + 1}`;
  const visible = useMemo(
    () => items.map((it, i) => ({ it, i })).filter(({ it }) => !query || JSON.stringify(it).toLowerCase().includes(query.toLowerCase())),
    [items, query],
  );
  // un ajuste único (p. ej. el titular): sin lista lateral
  const single = Boolean(view.fixed) && items.length === 1;
  const hasError = (i: number) => Object.keys(errors).some((k) => k === String(i) || k.startsWith(`${i}.`));

  const update = (patch: Item) => setItems((all) => all.map((it, i) => (i === selected ? { ...it, ...patch } : it)));
  const move = (delta: -1 | 1) => {
    const to = selected + delta;
    if (to < 0 || to >= items.length) return;
    setItems((all) => {
      const next = [...all];
      [next[selected], next[to]] = [next[to], next[selected]];
      return next;
    });
    setSelected(to);
  };
  const add = () => {
    const blank = structuredClone(view.blank);
    if (view.idField) blank[view.idField] = newId();
    setItems((all) => [...all, blank]);
    setSelected(items.length);
    setQuery("");
  };
  const remove = () => {
    if (!window.confirm(`¿Quitar «${title(current, selected)}»? Se quita del sitio al publicar.`)) return;
    setItems((all) => all.filter((_, i) => i !== selected));
    setSelected((s) => Math.max(0, s - 1));
  };

  return (
    <div className="space-y-6">
      <div className={cn("grid gap-6", !single && "lg:grid-cols-[20rem_minmax(0,1fr)]")}>
        <aside
          hidden={single}
          aria-label={`Lista de ${view.title.toLowerCase()}`}
          className="self-start rounded-2xl bg-white p-4 ring-1 ring-bruma lg:sticky lg:top-6"
        >
          {items.length > 8 && (
            <label className="mb-3 block">
              <span className="sr-only">Buscar</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar…"
                className="field min-h-10 py-2"
              />
            </label>
          )}
          <ol className="max-h-[60vh] space-y-1 overflow-y-auto">
            {visible.map(({ it, i }) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => setSelected(i)}
                  aria-current={i === selected}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-sm",
                    i === selected ? "bg-puno text-white" : "text-tinta hover:bg-cielo",
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 font-semibold">{title(it, i)}</span>
                    {view.subtitleField && (
                      <span className={cn("block truncate text-xs", i === selected ? "text-white/80" : "text-pizarra")}>
                        {text(it[view.subtitleField])}
                      </span>
                    )}
                  </span>
                  {hasError(i) && (
                    <span className="shrink-0 rounded-full bg-peligroso px-1.5 text-xs font-bold text-white" title="Tiene errores">
                      !
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ol>
          {!view.fixed && (
            <button
              type="button"
              onClick={add}
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-puno/50 font-bold text-puno hover:bg-celeste-50"
            >
              <Icon name="plus" size={18} />
              Agregar {view.itemName}
            </button>
          )}
        </aside>

        <section
          aria-label={current ? title(current, selected) : "Sin elementos"}
          className="rounded-2xl bg-white p-6 ring-1 ring-bruma md:p-8"
        >
          {current ? (
            <>
              <div className={cn("mb-6 flex flex-wrap items-center justify-between gap-3", single && "sr-only")}>
                <h2 className="text-xl font-extrabold text-puno-800">{single ? view.title : title(current, selected)}</h2>
                {!view.fixed && (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => move(-1)}
                      disabled={selected === 0}
                      className="grid size-10 place-items-center rounded-lg hover:bg-cielo disabled:opacity-30"
                    >
                      <Icon name="chevronLeft" size={18} className="rotate-90" />
                      <span className="sr-only">Subir</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => move(1)}
                      disabled={selected === items.length - 1}
                      className="grid size-10 place-items-center rounded-lg hover:bg-cielo disabled:opacity-30"
                    >
                      <Icon name="chevronRight" size={18} className="rotate-90" />
                      <span className="sr-only">Bajar</span>
                    </button>
                    <button
                      type="button"
                      onClick={remove}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-bold text-peligroso hover:bg-peligroso/5"
                    >
                      <Icon name="trash" size={16} />
                      Quitar
                    </button>
                  </div>
                )}
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                {view.fields.map((f) => (
                  <div
                    key={f.name}
                    className={
                      f.type === "object" || f.type === "list" || f.type === "textarea" || f.type === "lines" ? "md:col-span-2" : undefined
                    }
                  >
                    <FieldInput
                      field={f}
                      value={current[f.name]}
                      onChange={(v) => update({ [f.name]: v })}
                      path={`${selected}.${f.name}`}
                      errors={errors}
                      choices={choices}
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-pizarra">No hay elementos. Agrega el primero.</p>
          )}
        </section>
      </div>

      {/* barra de publicación */}
      <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/95 px-5 py-4 shadow-float ring-1 ring-bruma backdrop-blur">
        <div className="min-w-0 flex-1 space-y-1">
          <FormAlert state={state} success={state.status === "success" && state.data.message} />
          <FormAlert state={resetState} success={resetState.status === "success" && resetState.data.message} />
          {state.status === "error" && Object.keys(errors).some((k) => k !== "_") && (
            <p className="text-sm font-semibold text-peligroso">Revisa los elementos marcados con «!».</p>
          )}
          <p className="text-sm text-pizarra">
            {dirty ? "Tienes cambios sin publicar." : "Todo publicado."}
            {initial.updatedAt &&
              ` Última publicación: ${formatDate(initial.updatedAt, { dateStyle: "medium", timeStyle: "short" })}${initial.updatedBy ? ` por ${initial.updatedBy}` : ""}.`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {version > 0 && (
            <form
              action={restore}
              onSubmit={(e) => {
                if (!window.confirm("¿Volver a los datos originales del sitio? Se pierden los cambios publicados en esta colección."))
                  e.preventDefault();
              }}
            >
              <input type="hidden" name="key" value={view.key} />
              <SubmitButton variant="outline" pendingLabel="Restaurando…" className="min-h-12">
                Datos originales
              </SubmitButton>
            </form>
          )}
          <button
            type="button"
            onClick={() => setItems(saved)}
            disabled={!dirty}
            className="min-h-12 rounded-xl px-4 font-bold text-puno hover:bg-cielo disabled:invisible"
          >
            Descartar
          </button>
          <form action={publish}>
            <input type="hidden" name="key" value={view.key} />
            <input type="hidden" name="version" value={version} />
            <input type="hidden" name="items" value={JSON.stringify(items)} />
            <SubmitButton icon="check" disabled={!dirty} pendingLabel="Publicando…">
              Publicar cambios
            </SubmitButton>
          </form>
        </div>
      </div>
    </div>
  );
}
