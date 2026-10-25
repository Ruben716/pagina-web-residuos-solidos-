import type { CollectionRoute, Shift, Weekday } from "./types";

export type Schedulable = Pick<CollectionRoute, "status" | "days" | "start" | "end">;

export const TIME_ZONE = "America/Lima";

export const WEEKDAY_LABEL: Record<Weekday, string> = {
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
  7: "Domingo",
};

export const WEEKDAY_SHORT: Record<Weekday, string> = {
  1: "L",
  2: "M",
  3: "X",
  4: "J",
  5: "V",
  6: "S",
  7: "D",
};

export const SHIFT_LABEL: Record<Shift, string> = {
  manana: "Mañana",
  tarde: "Tarde",
  noche: "Noche",
};

export interface LimaClock {
  weekday: Weekday;
  minutes: number;
}

/** Hora actual en Puno, independiente de la zona horaria del visitante. */
export function limaClock(date = new Date()): LimaClock {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const map: Record<string, Weekday> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
  return { weekday: map[get("weekday")], minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export function formatTime(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h < 12 ? "a. m." : "p. m.";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function formatDays(days: readonly number[]) {
  const key = days.join(",");
  if (key === "1,2,3,4,5,6,7") return "Todos los días";
  if (key === "1,2,3,4,5,6") return "Lunes a sábado";
  const labels = days.map((d) => WEEKDAY_LABEL[d as Weekday].toLowerCase());
  const text = labels.length > 1 ? `${labels.slice(0, -1).join(", ")} y ${labels.at(-1)}` : labels[0];
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export type RouteState =
  | { kind: "en-curso"; progress: number; endsIn: number }
  | { kind: "proxima"; inDays: number; startsIn: number; weekday: Weekday }
  | { kind: "programada" };

/** Estado de la ruta según la hora de Lima: en curso (con avance 0–1) o cuándo pasa la próxima vez. */
export function routeState(route: Schedulable, clock: LimaClock = limaClock()): RouteState {
  if (route.status === "programado") return { kind: "programada" };
  const start = toMinutes(route.start);
  const end = toMinutes(route.end);

  if (route.days.includes(clock.weekday) && clock.minutes >= start && clock.minutes < end) {
    return { kind: "en-curso", progress: (clock.minutes - start) / (end - start), endsIn: end - clock.minutes };
  }

  for (let offset = 0; offset <= 7; offset++) {
    const weekday = (((clock.weekday - 1 + offset) % 7) + 1) as Weekday;
    if (!route.days.includes(weekday)) continue;
    if (offset === 0 && clock.minutes >= start) continue;
    return { kind: "proxima", inDays: offset, startsIn: offset * 1440 + start - clock.minutes, weekday };
  }
  return { kind: "programada" };
}

export function describeState(state: RouteState, route: Schedulable) {
  switch (state.kind) {
    case "en-curso":
      return `En recorrido, termina en ${formatDuration(state.endsIn)}`;
    case "programada":
      return "Ruta en implementación";
    case "proxima":
      if (state.inDays === 0) return `Hoy a las ${formatTime(route.start)}`;
      if (state.inDays === 1) return `Mañana a las ${formatTime(route.start)}`;
      return `${WEEKDAY_LABEL[state.weekday]} a las ${formatTime(route.start)}`;
  }
}

export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}
