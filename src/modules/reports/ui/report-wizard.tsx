"use client";

import { motion } from "motion/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { compressImage } from "@/shared/lib/compress-image";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { describedBy, Field } from "@/shared/ui/field";
import { Icon } from "@/shared/ui/icon";
import { BARRIOS, REPORT_TYPES } from "../domain/report";
import { submitReport, type ReportFormState } from "../server/actions";
import type { LatLngTuple } from "./pin-picker";

const PinPicker = dynamic(() => import("./pin-picker"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center bg-bruma text-sm text-pizarra">Cargando mapa…</div>,
});

const PLAZA_DE_ARMAS: LatLngTuple = [-15.8402, -70.0219];

const STEPS = [
  { title: "Qué y dónde", fields: ["type", "barrio", "address"] },
  { title: "Detalles y evidencia", fields: ["description", "photo"] },
  { title: "Contacto y envío", fields: ["name", "phone", "email"] },
] as const;

const initial: ReportFormState = { status: "idle" };

export function ReportWizard() {
  const params = useSearchParams();
  const [state, action, pending] = useActionState(submitReport, initial);
  const [step, setStep] = useState(0);
  const [position, setPosition] = useState<LatLngTuple>(PLAZA_DE_ARMAS);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [anonymous, setAnonymous] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const stepRefs = useRef<(HTMLFieldSetElement | null)[]>([]);
  const errors = state.status === "error" ? state.errors : {};

  // Si el servidor devuelve errores, vuelve al primer paso que los contiene (una vez por respuesta).
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state.status === "error") {
      const target = STEPS.findIndex((s) => s.fields.some((f) => state.errors[f]?.length));
      if (target >= 0) setStep(target);
    }
  }

  // Al cambiar de paso (no al cargar la página) el foco va al primer campo del paso nuevo.
  // Se compara con el paso anterior (y no con "primer render") para que el doble efecto de StrictMode no robe el foco.
  const shownStep = useRef(step);
  useEffect(() => {
    if (shownStep.current === step) return;
    shownStep.current = step;
    stepRefs.current[step]?.querySelector<HTMLElement>("input, select, textarea")?.focus({ preventScroll: true });
  }, [step]);

  const next = () => {
    const fieldset = stepRefs.current[step];
    const invalid =
      fieldset && [...fieldset.querySelectorAll<HTMLInputElement>("input, select, textarea")].find((el) => !el.checkValidity());
    if (invalid) {
      invalid.reportValidity();
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const locate = () => {
    if (!navigator.geolocation) return setGeoError("Tu navegador no permite compartir la ubicación. Mueve el pin en el mapa.");
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
      },
      () => {
        setGeoError("No pudimos obtener tu ubicación. Revisa el permiso del navegador o mueve el pin a mano.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  const onPhoto = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return setPreview(null);
    const small = await compressImage(file);
    const dt = new DataTransfer();
    dt.items.add(small);
    input.files = dt.files;
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(small);
    });
  }, []);

  if (state.status === "success") return <Success ticket={state.data.ticket} />;

  return (
    <form ref={formRef} action={action} noValidate={false}>
      <ol className="mb-10 grid grid-cols-3 gap-2" aria-label="Pasos del reporte">
        {STEPS.map((s, i) => (
          <li key={s.title} className="relative">
            {i > 0 && (
              <span aria-hidden className="absolute top-5 right-1/2 -left-1/2 -z-0 h-0.5 bg-bruma">
                <motion.span
                  className="absolute inset-0 origin-left bg-puno"
                  initial={false}
                  animate={{ scaleX: i <= step ? 1 : 0 }}
                  transition={{ duration: 0.6 }}
                />
              </span>
            )}
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              aria-current={i === step ? "step" : undefined}
              className="relative flex w-full flex-col items-center gap-2 text-center"
            >
              <span
                className={cn(
                  "grid size-10 place-items-center rounded-full border-2 text-sm font-extrabold transition-colors duration-500",
                  i < step && "border-puno bg-puno text-white",
                  i === step && "border-puno bg-white text-puno ring-4 ring-celeste-50",
                  i > step && "border-bruma bg-white text-pizarra",
                )}
              >
                {i < step ? <Icon name="check" size={18} /> : i + 1}
              </span>
              <span className={cn("text-xs font-bold sm:text-sm", i === step ? "text-puno-800" : "text-pizarra")}>
                <span className="sr-only">Paso {i + 1}: </span>
                {s.title}
              </span>
            </button>
          </li>
        ))}
      </ol>

      <div>
        {/* Paso 1 */}
        <fieldset ref={(el) => void (stepRefs.current[0] = el)} hidden={step !== 0} className="step-in space-y-10">
          <legend className="sr-only">Paso 1: qué y dónde</legend>
          <div>
            <p id="type-label" className="text-sm font-bold text-tinta">
              ¿Qué quieres reportar?
            </p>
            <div role="radiogroup" aria-labelledby="type-label" className="mt-4 grid gap-2 sm:grid-cols-2">
              {REPORT_TYPES.map((t) => (
                <label
                  key={t.id}
                  className="group relative flex cursor-pointer flex-col gap-1 rounded-xl border border-niebla bg-white p-4 pr-10 transition-colors hover:border-puno has-checked:border-puno has-checked:bg-celeste-50 has-checked:ring-1 has-checked:ring-puno has-focus-visible:outline-3 has-focus-visible:outline-inti"
                >
                  <input
                    type="radio"
                    name="type"
                    value={t.id}
                    required
                    defaultChecked={params.get("tipo") === t.id}
                    className="peer sr-only"
                  />
                  <span className="font-bold text-puno-800">{t.label}</span>
                  <span className="text-sm text-pizarra">{t.hint}</span>
                  <Icon name="check" size={18} className="absolute top-4 right-4 text-puno opacity-0 peer-checked:opacity-100" />
                </label>
              ))}
            </div>
            {errors.type && <p className="mt-2 text-sm font-medium text-peligroso">{errors.type[0]}</p>}
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <Field id="barrio" label="Barrio o sector" error={errors.barrio}>
              <select
                id="barrio"
                name="barrio"
                required
                defaultValue=""
                className="field"
                aria-describedby={describedBy("barrio", errors.barrio)}
                aria-invalid={!!errors.barrio}
              >
                <option value="" disabled>
                  Elige un barrio
                </option>
                {BARRIOS.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </Field>
            <Field
              id="address"
              label="Dirección o referencia"
              error={errors.address}
              hint="Ej.: Jr. Deustua con Jr. Lima, frente a la bodega"
            >
              <input
                id="address"
                name="address"
                required
                minLength={5}
                autoComplete="street-address"
                className="field"
                aria-describedby={describedBy("address", errors.address, true)}
                aria-invalid={!!errors.address}
              />
            </Field>
          </div>

          <div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-tinta">Ubicación en el mapa</p>
                <p className="mt-1 text-sm text-pizarra">Toca el mapa o arrastra el pin hasta el punto exacto.</p>
              </div>
              <button
                type="button"
                onClick={locate}
                disabled={locating}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-puno/40 bg-white px-4 text-sm font-bold text-puno hover:bg-celeste-50"
              >
                <Icon name="crosshair" size={18} />
                {locating ? "Buscando tu ubicación…" : "Usar mi ubicación"}
              </button>
            </div>
            <div className="mt-4 h-80 overflow-hidden rounded-2xl ring-1 ring-bruma">
              <PinPicker position={position} onChange={setPosition} />
            </div>
            <p className="mt-2 text-sm text-pizarra tabular-nums" aria-live="polite">
              {geoError ?? `Coordenadas: ${position[0].toFixed(5)}, ${position[1].toFixed(5)}`}
            </p>
            <input type="hidden" name="lat" value={position[0]} />
            <input type="hidden" name="lng" value={position[1]} />
            {params.get("ruta") && <input type="hidden" name="route" value={params.get("ruta")!} />}
          </div>
        </fieldset>

        {/* Paso 2 */}
        <fieldset ref={(el) => void (stepRefs.current[1] = el)} hidden={step !== 1} className="step-in space-y-10">
          <legend className="sr-only">Paso 2: detalles y evidencia</legend>
          <Field
            id="description"
            label="¿Qué está pasando?"
            error={errors.description}
            hint="Cuenta qué ves, desde cuándo y si se repite. Si viste quién arrojó la basura, descríbelo sin datos personales."
          >
            <textarea
              id="description"
              name="description"
              required
              minLength={15}
              rows={5}
              className="field resize-y"
              aria-describedby={describedBy("description", errors.description, true)}
              aria-invalid={!!errors.description}
            />
          </Field>

          <Field id="photo" label="Foto de evidencia" optional error={errors.photo}>
            <label
              htmlFor="photo"
              className="flex min-h-48 cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed border-niebla bg-cielo/60 p-6 text-center transition-colors hover:border-puno hover:bg-celeste-50"
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Vista previa de la foto adjunta" className="max-h-64 rounded-2xl object-contain" />
              ) : (
                <>
                  <Icon name="camera" size={32} className="text-puno" />
                  <span className="font-medium">Toma una foto o elige una de tu galería</span>
                  <span className="text-sm text-pizarra">JPG, PNG o WebP. La reducimos antes de enviarla.</span>
                </>
              )}
            </label>
            <input id="photo" name="photo" type="file" accept="image/*" capture="environment" onChange={onPhoto} className="sr-only" />
          </Field>
        </fieldset>

        {/* Paso 3 */}
        <fieldset ref={(el) => void (stepRefs.current[2] = el)} hidden={step !== 2} className="step-in space-y-10">
          <legend className="sr-only">Paso 3: contacto y envío</legend>
          <label className="flex cursor-pointer items-start gap-4 rounded-xl border border-bruma bg-cielo p-5">
            <input
              type="checkbox"
              name="anonymous"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="mt-1 size-5 accent-puno"
            />
            <span>
              <span className="block font-bold text-puno-800">Enviar como reporte anónimo</span>
              <span className="text-sm text-pizarra">
                No guardamos tu nombre ni tu teléfono. Igual recibirás un código para seguir el caso.
              </span>
            </span>
          </label>

          {/* Si el reporte es anónimo, los campos se desactivan: no se validan ni se envían. */}
          <div
            inert={anonymous}
            className={cn(
              "grid transition-[grid-template-rows,opacity] duration-500 ease-out-expo",
              anonymous ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100",
            )}
          >
            <fieldset disabled={anonymous} className="min-h-0 overflow-hidden">
              <legend className="sr-only">Datos de contacto</legend>
              <div className="grid gap-8 pb-1 sm:grid-cols-2">
                <Field id="name" label="Nombre y apellido" error={errors.name}>
                  <input
                    id="name"
                    name="name"
                    required
                    minLength={3}
                    autoComplete="name"
                    className="field"
                    aria-invalid={!!errors.name}
                    aria-describedby={describedBy("name", errors.name)}
                  />
                </Field>
                <Field id="phone" label="Celular" error={errors.phone} hint="Te escribimos sólo sobre este reporte.">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    required
                    pattern="9[0-9 ]{8,10}"
                    autoComplete="tel-national"
                    className="field tabular-nums"
                    aria-invalid={!!errors.phone}
                    aria-describedby={describedBy("phone", errors.phone, true)}
                  />
                </Field>
                <Field id="email" label="Correo electrónico" optional error={errors.email} className="sm:col-span-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="field"
                    aria-invalid={!!errors.email}
                    aria-describedby={describedBy("email", errors.email)}
                  />
                </Field>
              </div>
            </fieldset>
          </div>

          <p className="max-w-[60ch] text-sm leading-relaxed text-pizarra">
            Al enviar aceptas que la Municipalidad use estos datos sólo para atender el reporte, conforme a la Ley N.° 29733 de Protección
            de Datos Personales.
          </p>
        </fieldset>

        <div className="mt-10 flex items-center justify-between gap-4 border-t border-bruma pt-6">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="inline-flex min-h-12 items-center gap-2 rounded-xl px-3 font-bold text-pizarra hover:bg-cielo hover:text-tinta"
            >
              <Icon name="arrow" size={18} className="rotate-180" />
              Volver
            </button>
          ) : (
            <span />
          )}
          {step < STEPS.length - 1 ? (
            <Button onClick={next} icon="arrow">
              Continuar
            </Button>
          ) : (
            <Button type="submit" disabled={pending} icon={pending ? undefined : "arrow"}>
              {pending ? "Enviando reporte…" : "Enviar reporte"}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

function Success({ ticket }: { ticket: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="mx-auto max-w-3xl py-10 text-center"
      role="status"
    >
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-aprovechable text-white">
        <Icon name="check" size={30} />
      </span>
      <h2 className="mt-6 text-3xl font-extrabold text-puno-800 md:text-4xl">Reporte enviado</h2>
      <p className="mx-auto mt-4 max-w-[48ch] text-lg text-pizarra">
        Guarda este código. Con él puedes ver en qué etapa está la atención de tu reporte.
      </p>
      <p className="numeral mx-auto mt-8 w-fit rounded-2xl bg-cielo px-8 py-5 text-[clamp(2.5rem,8vw,4.5rem)] tracking-[0.02em] text-puno">
        {ticket}
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button
          variant="outline"
          onClick={async () => {
            await navigator.clipboard.writeText(ticket);
            setCopied(true);
          }}
        >
          {copied ? "Código copiado" : "Copiar código"}
        </Button>
        <Link
          href={`/reporta/seguimiento?codigo=${ticket}`}
          className="inline-flex min-h-12 items-center rounded-xl bg-puno px-6 font-bold text-white hover:bg-puno-800"
        >
          Ver seguimiento
        </Link>
      </div>
    </motion.div>
  );
}
