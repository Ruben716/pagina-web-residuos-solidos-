import { ROUTES } from "../data/routes";
import { SECTORS } from "../data/sectors";
import type { SectorId } from "./types";

export const getRoutes = () => ROUTES;

export const getRoute = (slug: string) => ROUTES.find((r) => r.slug === slug);

export const getSectors = () => SECTORS;

export const getSector = (id: SectorId) => SECTORS.find((s) => s.id === id)!;

export const routesBySector = (id: SectorId) => ROUTES.filter((r) => r.sector === id);

export function routeTotals() {
  return {
    routes: ROUTES.length,
    households: ROUTES.reduce((sum, r) => sum + r.households, 0),
    km: Math.round(ROUTES.reduce((sum, r) => sum + r.km, 0)),
    streets: ROUTES.reduce((sum, r) => sum + r.streets.length, 0),
    active: ROUTES.filter((r) => r.status === "activo").length,
  };
}

export function neighbours(slug: string) {
  const i = ROUTES.findIndex((r) => r.slug === slug);
  return { prev: ROUTES[i - 1], next: ROUTES[i + 1] };
}
