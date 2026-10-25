import { cn } from "@/shared/lib/cn";
import { formatDays, WEEKDAY_LABEL, WEEKDAY_SHORT } from "../domain/schedule";
import type { Weekday } from "../domain/types";

const WEEK: Weekday[] = [1, 2, 3, 4, 5, 6, 7];

interface Props {
  days: readonly number[];
  today?: Weekday | null;
  tone?: "light" | "dark";
  className?: string;
}

/** Semana como tira de siete días: los días de servicio van en el color de marca y hoy lleva un anillo. */
export function WeekStrip({ days, today, tone = "light", className }: Props) {
  const dark = tone === "dark";
  return (
    <span className={cn("inline-flex gap-1.5", className)} role="img" aria-label={`Días de servicio: ${formatDays(days)}`}>
      {WEEK.map((d) => {
        const on = days.includes(d);
        return (
          <span
            key={d}
            title={WEEKDAY_LABEL[d]}
            className={cn(
              "grid size-8 place-items-center rounded-lg text-xs font-extrabold transition-colors",
              on ? (dark ? "bg-white text-puno-800" : "bg-puno text-white") : dark ? "bg-white/10 text-white/55" : "bg-cielo text-pizarra",
              today === d && "ring-2 ring-celeste ring-offset-2",
            )}
          >
            {WEEKDAY_SHORT[d]}
          </span>
        );
      })}
    </span>
  );
}
