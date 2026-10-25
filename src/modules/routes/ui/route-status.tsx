"use client";

import { cn } from "@/shared/lib/cn";
import { describeState, routeState, type Schedulable } from "../domain/schedule";
import { useLimaClock } from "./use-lima-clock";

/** Estado de una ruta según la hora de Puno: en recorrido, próxima salida o en implementación. */
export function RouteStatus({ route, className }: { route: Schedulable; className?: string }) {
  const clock = useLimaClock();
  if (!clock) return <span className={cn("inline-block h-5 w-36 animate-pulse rounded-full bg-bruma", className)} aria-hidden />;
  const state = routeState(route, clock);
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm", className)}>
      <span
        aria-hidden
        className={cn(
          "size-2.5 shrink-0 rounded-full",
          state.kind === "en-curso" ? "animate-pulse-soft bg-exito" : state.kind === "programada" ? "bg-niebla" : "bg-puno-500",
        )}
      />
      {describeState(state, route)}
    </span>
  );
}
