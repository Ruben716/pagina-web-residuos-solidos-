import "server-only";
import { createJsonStore } from "@/shared/server/json-store";
import type { CitizenReport } from "../domain/report";

export const reportsRepository = createJsonStore<CitizenReport>("reportes");
