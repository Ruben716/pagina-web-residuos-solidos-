// API pública del módulo de rutas. Otras partes del sitio importan sólo desde aquí.
import { ROUTES } from "./data/routes";
import type { PlannerRoute } from "./ui/route-planner";

export * from "./domain/queries";
export * from "./domain/schedule";
export type * from "./domain/types";

/** Vista recortada para el planificador (Client Component): todo menos la descripción larga. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const plannerView = (): PlannerRoute[] => ROUTES.map(({ description, ...rest }) => rest);

export { LazyRouteMap } from "./ui/lazy-route-map";
export { SECTOR_COLOR } from "./ui/route-map-colors";
export { RoutePlanner } from "./ui/route-planner";
export { RoutePlannerFromUrl } from "./ui/route-planner-from-url";
export { RouteStatus } from "./ui/route-status";
export { RoutesTable } from "./ui/routes-table";
export { WeekStrip } from "./ui/week-strip";
