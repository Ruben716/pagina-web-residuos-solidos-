"use client";

import { AnimatePresence, motion } from "motion/react";
import { useDeferredValue, useMemo, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icon";
import type { Bin, BinId, WasteItem } from "../data";

const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

/** "¿Dónde va esto?": índice alfabético filtrable de objetos cotidianos. */
export function WhereDoesItGo({ items, bins }: { items: readonly WasteItem[]; bins: readonly Bin[] }) {
  const [query, setQuery] = useState("");
  const [bin, setBin] = useState<BinId | null>(null);
  const [picked, setPicked] = useState<WasteItem | null>(null);
  const q = useDeferredValue(query);
  const byId = useMemo(() => new Map(bins.map((b) => [b.id, b])), [bins]);

  const groups = useMemo(() => {
    const list = items
      .filter((i) => (!bin || i.bin === bin) && fold(i.name).includes(fold(q.trim())))
      .toSorted((a, b) => a.name.localeCompare(b.name, "es"));
    const map = new Map<string, WasteItem[]>();
    for (const item of list) {
      const letter = fold(item.name[0]).toUpperCase();
      map.set(letter, [...(map.get(letter) ?? []), item]);
    }
    return [...map.entries()];
  }, [items, bin, q]);

  const answer = picked ? byId.get(picked.bin)! : null;

  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <div className="flex items-center gap-3 rounded-2xl border border-niebla bg-white px-5 shadow-sm transition-colors focus-within:border-puno">
          <Icon name="search" size={24} className="text-puno" />
          <label htmlFor="item-q" className="sr-only">
            Escribe un objeto, por ejemplo: pilas, tetrapak, pañales
          </label>
          <input
            id="item-q"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pilas, tetrapak, pañales…"
            className="min-h-16 flex-1 bg-transparent text-xl font-semibold outline-none placeholder:text-pizarra/70 focus-visible:shadow-none focus-visible:outline-none"
          />
        </div>
        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filtrar por color">
          {[null, ...bins.map((b) => b.id)].map((id) => {
            const b = id ? byId.get(id)! : null;
            return (
              <button
                key={id ?? "all"}
                type="button"
                aria-pressed={bin === id}
                onClick={() => setBin(id)}
                className={cn(
                  "flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-bold transition-colors",
                  bin === id ? "border-puno bg-puno text-white" : "border-niebla bg-white hover:border-puno",
                )}
              >
                {b && <span aria-hidden className="size-3 rounded-full" style={{ background: b.swatch }} />}
                {b ? b.color : "Todos"}
              </button>
            );
          })}
        </div>

        <div className="mt-8 max-h-[34rem] overflow-y-auto rounded-2xl border border-bruma bg-white px-5 pr-3" data-lenis-prevent>
          {groups.length === 0 && (
            <p className="py-8 text-lg text-pizarra">
              No tenemos “{q}” en el índice. Si tienes dudas, ponlo en la bolsa negra y consúltanos en la central.
            </p>
          )}
          {groups.map(([letter, list]) => (
            <div key={letter} className="grid grid-cols-[2.5rem_1fr] border-b border-bruma py-4 last:border-0">
              <span aria-hidden className="numeral pt-1.5 text-2xl text-puno-500/50">
                {letter}
              </span>
              <ul className="flex flex-wrap gap-x-2 gap-y-2">
                {list.map((item) => {
                  const b = byId.get(item.bin)!;
                  const active = picked?.name === item.name;
                  return (
                    <li key={item.name}>
                      <button
                        type="button"
                        onClick={() => setPicked(item)}
                        aria-pressed={active}
                        className={cn(
                          "flex min-h-10 items-center gap-2 rounded-full px-3 text-left transition-colors",
                          active ? "bg-puno-800 text-white" : "hover:bg-celeste-50",
                        )}
                      >
                        <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: b.swatch }} />
                        {item.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]" aria-live="polite">
          <AnimatePresence mode="wait">
            {picked && answer ? (
              <motion.div
                key={picked.name}
                initial={{ clipPath: "inset(0 0 100% 0 round 1.5rem)" }}
                animate={{ clipPath: "inset(0 0 0% 0 round 1.5rem)" }}
                exit={{ clipPath: "inset(100% 0 0% 0 round 1.5rem)" }}
                transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
                className="flex min-h-[26rem] flex-col justify-between rounded-3xl p-8 md:p-10"
                style={{ background: answer.swatch, color: answer.ink }}
              >
                <p className="text-lg opacity-85">{picked.name} va en la bolsa</p>
                <div>
                  <p className="text-[clamp(3.5rem,8vw,6rem)] leading-[0.85] font-extrabold tracking-[-0.04em]">{answer.color}</p>
                  <p className="mt-3 text-2xl font-bold">Residuos {answer.name.toLowerCase()}</p>
                  {picked.note && <p className="mt-6 max-w-[36ch] leading-relaxed opacity-90">{picked.note}</p>}
                  <p className="mt-6 border-t border-current/25 pt-5 text-sm opacity-80">{answer.schedule}</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex min-h-[26rem] flex-col justify-end rounded-3xl border border-dashed border-niebla bg-white p-8 md:p-10"
              >
                <div className="mb-8 flex gap-2" aria-hidden>
                  {bins.map((b) => (
                    <span key={b.id} className="h-16 flex-1 rounded-xl" style={{ background: b.swatch }} />
                  ))}
                </div>
                <p className="text-2xl font-extrabold text-puno-800">Elige un objeto y te decimos en qué color va.</p>
                <p className="mt-3 text-pizarra">{items.length} objetos cotidianos, ordenados de la A a la Z.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
