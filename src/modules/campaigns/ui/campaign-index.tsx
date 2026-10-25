"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useActionState, useState } from "react";
import type { Media } from "@/shared/content/media";
import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icon";
import type { Campaign } from "../data";
import { joinCampaign, type JoinState } from "../server/actions";

export interface CampaignRow extends Campaign {
  media: Media;
  past: boolean;
  /** fechas ya formateadas en el servidor (evita diferencias de ICU al hidratar) */
  when: { day: string; month: string; weekday: string; hours: string };
}

/** Agenda de campañas: fecha, foto, lugar, horario y meta. Cada fila se expande para inscribirse sin salir de la página. */
export function CampaignIndex({ rows }: { rows: readonly CampaignRow[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <ul className="space-y-4">
      {rows.map((c, i) => (
        <motion.li
          key={c.slug}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-8% 0px" }}
          transition={{ duration: 0.7, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "overflow-hidden rounded-2xl bg-white ring-1 ring-bruma transition-shadow hover:shadow-panel",
            c.past && "bg-cielo/60",
          )}
        >
          <article className="group grid gap-5 p-4 md:grid-cols-[5.5rem_11rem_1fr_auto] md:items-center md:gap-6 md:p-5">
            <p
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 md:flex-col md:gap-0 md:py-4 md:text-center",
                c.past ? "bg-bruma text-pizarra" : "bg-puno-800 text-white",
              )}
            >
              <span className="numeral text-4xl">{c.when.day}</span>
              <span className="text-xs font-bold tracking-[0.1em] uppercase">
                {c.when.month}
                <span className="block font-semibold tracking-normal normal-case opacity-80">{c.when.weekday}</span>
              </span>
            </p>
            <div className="relative hidden aspect-[4/3] overflow-hidden rounded-xl bg-bruma md:block">
              <Image
                src={c.media.src}
                alt=""
                fill
                sizes="176px"
                className={cn(
                  "object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105",
                  c.past && "grayscale-[40%]",
                )}
              />
            </div>
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-celeste-50 px-2.5 py-0.5 text-xs font-bold text-puno">{c.kind}</span>
                {c.past && <span className="rounded-full bg-bruma px-2.5 py-0.5 text-xs font-bold text-pizarra">Realizada</span>}
              </p>
              <h3 className="mt-2 text-xl font-extrabold text-puno-800">{c.title}</h3>
              <p className="mt-1 text-pizarra">{c.summary}</p>
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-tinta">
                <li className="flex items-center gap-1.5">
                  <Icon name="pin" size={15} className="shrink-0 text-puno" />
                  {c.place}
                </li>
                <li className="flex items-center gap-1.5">
                  <Icon name="clock" size={15} className="shrink-0 text-puno" />
                  {c.when.hours}
                </li>
                <li className="flex items-center gap-1.5 font-semibold">
                  <Icon name={c.past ? "checkCircle" : "leaf"} size={15} className="shrink-0 text-exito" />
                  {c.past && c.result ? c.result : `Meta: ${c.goal}`}
                </li>
              </ul>
            </div>
            {!c.past && (
              <button
                type="button"
                aria-expanded={open === c.slug}
                aria-controls={`join-${c.slug}`}
                onClick={() => setOpen((o) => (o === c.slug ? null : c.slug))}
                className={cn(
                  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition-colors",
                  open === c.slug ? "bg-cielo text-puno-800" : "bg-puno text-white hover:bg-puno-800",
                )}
              >
                <Icon name={open === c.slug ? "close" : "users"} size={17} />
                {open === c.slug ? "Cerrar" : "Unirme"}
              </button>
            )}
          </article>
          <AnimatePresence initial={false}>
            {open === c.slug && (
              <motion.div
                id={`join-${c.slug}`}
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <JoinForm campaign={c} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.li>
      ))}
    </ul>
  );
}

const initial: JoinState = { status: "idle" };

function JoinForm({ campaign }: { campaign: CampaignRow }) {
  const [state, action, pending] = useActionState(joinCampaign, initial);
  const errors = state.status === "error" ? state.errors : {};

  if (state.status === "success") {
    return (
      <p role="status" className="flex items-start gap-3 border-t border-bruma bg-celeste-50 px-5 py-5 font-semibold text-puno-800">
        <Icon name="checkCircle" size={22} className="shrink-0 text-exito" />
        Gracias, {state.data.name}. Te esperamos en {campaign.place}. Te escribiremos un día antes con los detalles.
      </p>
    );
  }

  return (
    <form action={action} className="grid gap-4 border-t border-bruma bg-cielo/70 px-5 py-5 md:grid-cols-[1fr_1fr_auto] md:items-end">
      <input type="hidden" name="campaign" value={campaign.slug} />
      <div className="flex flex-col gap-2">
        <label htmlFor={`n-${campaign.slug}`} className="text-sm font-bold">
          Nombre
        </label>
        <input
          id={`n-${campaign.slug}`}
          name="name"
          required
          minLength={3}
          autoComplete="name"
          className="field"
          aria-invalid={!!errors.name}
        />
        {errors.name && <p className="text-sm font-semibold text-peligroso">{errors.name[0]}</p>}
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor={`p-${campaign.slug}`} className="text-sm font-bold">
          Celular
        </label>
        <input
          id={`p-${campaign.slug}`}
          name="phone"
          type="tel"
          inputMode="numeric"
          required
          pattern="9[0-9 ]{8,10}"
          autoComplete="tel-national"
          className="field"
          aria-invalid={!!errors.phone}
        />
        {errors.phone && <p className="text-sm font-semibold text-peligroso">{errors.phone[0]}</p>}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="min-h-12 rounded-xl bg-puno px-6 font-bold text-white transition-colors hover:bg-puno-800 disabled:opacity-60"
      >
        {pending ? "Inscribiendo…" : "Confirmar inscripción"}
      </button>
    </form>
  );
}
