export { OFFICE_SOURCES } from "./data";
export {
  FIGURES_KEY,
  FIGURES_VIEW,
  figuresSchema,
  LINES_KEY,
  LINES_VIEW,
  linesSchema,
  MANAGEMENT_KEY,
  MANAGEMENT_VIEW,
  managementSchema,
  OFFICE_DEFAULTS,
  PAGE_OPTIONS,
  SERVICES_KEY,
  SERVICES_VIEW,
  servicesSchema,
  SUBUNITS_KEY,
  SUBUNITS_VIEW,
  subunitsSchema,
} from "./domain/content";
export { getOfficeContent } from "./server/content";
export type { Figure, Unit, WorkLine } from "./data";
export { OrgChart } from "./ui/org-chart";
export { PortalLinks } from "./ui/portal-links";
export { WorkLines } from "./ui/work-lines";
