"use client";

import { useSyncExternalStore } from "react";
import { limaClock, type LimaClock } from "../domain/schedule";

let snapshot: LimaClock | null = null;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function tick() {
  const next = limaClock();
  if (!snapshot || next.minutes !== snapshot.minutes || next.weekday !== snapshot.weekday) {
    snapshot = next;
    listeners.forEach((l) => l());
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    tick();
    timer = setInterval(tick, 15_000);
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

/** Hora de Puno compartida por todos los componentes. `null` durante el render en servidor. */
export function useLimaClock() {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => null,
  );
}
