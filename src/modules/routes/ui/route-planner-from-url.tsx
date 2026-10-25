"use client";

import { useSearchParams } from "next/navigation";
import { RoutePlanner } from "./route-planner";

type Props = Omit<Parameters<typeof RoutePlanner>[0], "initialQuery" | "initialSelected">;

/** Planificador que arranca con ?q= (calle buscada) o ?ruta= (ruta elegida) de la URL. Necesita <Suspense>. */
export function RoutePlannerFromUrl(props: Props) {
  const params = useSearchParams();
  const ruta = params.get("ruta");
  return (
    <RoutePlanner
      {...props}
      initialQuery={params.get("q") ?? ""}
      initialSelected={ruta && props.routes.some((r) => r.slug === ruta) ? ruta : undefined}
    />
  );
}
