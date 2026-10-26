"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import { type Bin, type BinId, ITEM_EMOJI, type WasteItem } from "../data";
import { BinArt } from "./bin-art";

const ROUNDS = 8;

/** Ocho objetos al azar, sin repetir, con al menos uno de cada color. */
function deal(items: readonly WasteItem[], bins: readonly Bin[]) {
  const shuffled = items.toSorted(() => Math.random() - 0.5);
  const one = bins.map((b) => shuffled.find((i) => i.bin === b.id)!);
  const rest = shuffled.filter((i) => !one.includes(i)).slice(0, ROUNDS - one.length);
  return [...one, ...rest].toSorted(() => Math.random() - 0.5);
}

type Phase =
  | { kind: "intro" }
  | { kind: "play"; deck: WasteItem[]; round: number; score: number; answer: BinId | null }
  | { kind: "end"; score: number };

/**
 * Juego "¿En qué bolsa va?" (como el de Strathcona County): aparece un objeto y se elige el color.
 * El tacho correcto abre la tapa y se explica por qué; al final, el puntaje.
 */
export function SortingGame({ items, bins }: { items: readonly WasteItem[]; bins: readonly Bin[] }) {
  const [phase, setPhase] = useState<Phase>({ kind: "intro" });
  const byId = new Map(bins.map((b) => [b.id, b]));

  const start = () => setPhase({ kind: "play", deck: deal(items, bins), round: 0, score: 0, answer: null });

  if (phase.kind === "intro") {
    return (
      <div className="flex flex-col items-center text-center">
        <div aria-hidden className="flex gap-3">
          {bins.map((b, i) => (
            <motion.div
              key={b.id}
              className="w-14 md:w-16"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
            >
              <BinArt bin={b} open={false} />
            </motion.div>
          ))}
        </div>
        <p className="mt-8 max-w-[46ch] text-lg leading-relaxed text-pizarra">
          Te mostramos {ROUNDS} objetos de todos los días. Elige en qué bolsa va cada uno y mira cuánto sabes.
        </p>
        <Button icon="play" onClick={start} className="mt-6">
          Empezar a jugar
        </Button>
      </div>
    );
  }

  if (phase.kind === "end") {
    const great = phase.score >= ROUNDS - 1;
    return (
      <div className="flex flex-col items-center text-center" aria-live="polite">
        <p className="numeral text-7xl text-puno-800">
          {phase.score}/{ROUNDS}
        </p>
        <p className="mt-3 text-2xl font-extrabold text-tinta">
          {great
            ? "¡Excelente! Ya separas como experto."
            : phase.score >= ROUNDS / 2
              ? "¡Bien! Vas por buen camino."
              : "Sigue practicando: el buscador te ayuda."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button icon="arrow" onClick={start}>
            Jugar otra vez
          </Button>
          <a href="#buscador" className="inline-flex min-h-12 items-center gap-2 px-3 font-bold text-puno hover:underline">
            <Icon name="search" size={18} />
            Ir al buscador
          </a>
        </div>
      </div>
    );
  }

  const item = phase.deck[phase.round];
  const right = byId.get(item.bin)!;
  const answered = phase.answer !== null;
  const correct = phase.answer === item.bin;

  const choose = (id: BinId) => {
    if (answered) return;
    setPhase({ ...phase, answer: id, score: phase.score + (id === item.bin ? 1 : 0) });
  };
  const next = () =>
    phase.round + 1 >= ROUNDS
      ? setPhase({ kind: "end", score: phase.score })
      : setPhase({ ...phase, round: phase.round + 1, answer: null });

  return (
    <div className="mx-auto max-w-3xl">
      {/* progreso */}
      <div className="flex items-center justify-between gap-4 text-sm font-bold text-pizarra">
        <span>
          Objeto {phase.round + 1} de {ROUNDS}
        </span>
        <span className="inline-flex items-center gap-1.5 text-puno">
          <Icon name="checkCircle" size={16} />
          {phase.score} {phase.score === 1 ? "acierto" : "aciertos"}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-bruma">
        <motion.div
          className="h-full rounded-full bg-puno"
          animate={{ width: `${((phase.round + (answered ? 1 : 0)) / ROUNDS) * 100}%` }}
        />
      </div>

      {/* el objeto */}
      <AnimatePresence mode="wait">
        <motion.div
          key={item.name}
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 flex flex-col items-center text-center"
        >
          <motion.span
            aria-hidden
            className="grid size-28 place-items-center rounded-full bg-white text-6xl shadow-float md:size-32 md:text-7xl"
            animate={answered && !correct ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
            transition={{ duration: 0.45 }}
          >
            {ITEM_EMOJI[item.name] ?? "🗑️"}
          </motion.span>
          <h3 className="mt-5 text-2xl font-extrabold text-puno-800 md:text-3xl">{item.name}</h3>
          <p className="mt-1 text-pizarra">¿En qué bolsa va?</p>
        </motion.div>
      </AnimatePresence>

      {/* los cuatro tachos */}
      <div role="group" aria-label="Elige un color" className="mt-8 grid grid-cols-4 gap-3 sm:gap-5">
        {[...byId.values()].map((b) => {
          const isRight = answered && b.id === item.bin;
          const isWrong = answered && b.id === phase.answer && !correct;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => choose(b.id)}
              disabled={answered}
              aria-label={`Bolsa ${b.colorName}: ${b.name}`}
              className={cn(
                "group flex flex-col items-center rounded-2xl p-2 transition-opacity disabled:cursor-default sm:p-3",
                answered && !isRight && !isWrong && "opacity-40",
              )}
            >
              <motion.span
                className="block w-full max-w-[6.5rem]"
                animate={{ y: isRight ? -12 : 0 }}
                whileHover={answered ? undefined : { y: -6 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
              >
                <BinArt bin={b} open={isRight} />
              </motion.span>
              <span className="mt-2 text-sm font-extrabold text-tinta sm:text-base">{b.color}</span>
              <span className="hidden text-xs text-pizarra sm:block">{b.name}</span>
            </button>
          );
        })}
      </div>

      {/* resultado */}
      <div aria-live="polite" className="min-h-28">
        {answered && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left"
          >
            <p className="flex items-start gap-3">
              <span
                className={cn("grid size-10 shrink-0 place-items-center rounded-full text-white", correct ? "bg-exito" : "bg-peligroso")}
              >
                <Icon name={correct ? "check" : "close"} size={20} />
              </span>
              <span>
                <strong className="block text-lg font-extrabold text-tinta">
                  {correct ? "¡Correcto!" : `Va en la bolsa ${right.colorName}`}
                </strong>
                <span className="text-pizarra">{item.note ?? `Residuos ${right.name.toLowerCase()}.`}</span>
              </span>
            </p>
            <Button icon="arrow" onClick={next} className="shrink-0">
              {phase.round + 1 >= ROUNDS ? "Ver mi puntaje" : "Siguiente"}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
