import "server-only";
import { parseDoc, readContentDoc } from "@/modules/content";
import {
  FIGURES_KEY,
  figuresSchema,
  LINES_KEY,
  linesSchema,
  MANAGEMENT_KEY,
  managementSchema,
  OFFICE_DEFAULTS,
  SERVICES_KEY,
  servicesSchema,
  SUBUNITS_KEY,
  subunitsSchema,
} from "../domain/content";

/** Contenido vigente de la gerencia: lo del panel o, si nunca se editó, lo del código. */
export async function getOfficeContent() {
  const [management, subunits, lines, figures, services] = await Promise.all([
    readContentDoc(MANAGEMENT_KEY),
    readContentDoc(SUBUNITS_KEY),
    readContentDoc(LINES_KEY),
    readContentDoc(FIGURES_KEY),
    readContentDoc(SERVICES_KEY),
  ]);
  return {
    management: parseDoc(management, managementSchema, OFFICE_DEFAULTS.management)[0],
    subunits: parseDoc(subunits, subunitsSchema, OFFICE_DEFAULTS.subunits),
    lines: parseDoc(lines, linesSchema, OFFICE_DEFAULTS.lines),
    figures: parseDoc(figures, figuresSchema, OFFICE_DEFAULTS.figures),
    services: parseDoc(services, servicesSchema, OFFICE_DEFAULTS.services),
  };
}
