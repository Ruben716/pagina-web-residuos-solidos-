"use server";

import { z } from "zod";
import { saveUpload } from "@/shared/server/json-store";
import { formDataToObject, type FormState } from "@/shared/server/form";
import { createTicket, reportSchema, type CitizenReport } from "../domain/report";
import { reportsRepository } from "./repository";

export type ReportFormState = FormState<{ ticket: string }>;

export async function submitReport(_prev: ReportFormState, formData: FormData): Promise<ReportFormState> {
  const parsed = reportSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { status: "error", errors: z.flattenError(parsed.error).fieldErrors };
  }

  const data = parsed.data;
  const photo = data.photo && data.photo.size > 0 ? await saveUpload("reportes", data.photo) : null;

  const report: CitizenReport = {
    id: createTicket(),
    createdAt: new Date().toISOString(),
    status: "recibido",
    type: data.type,
    barrio: data.barrio,
    address: data.address,
    lat: data.lat,
    lng: data.lng,
    route: data.route,
    description: data.description,
    photo,
    anonymous: data.anonymous,
    contact: data.anonymous ? undefined : { name: data.name, phone: data.phone, email: data.email || undefined },
  };

  await reportsRepository.insert(report);
  return { status: "success", data: { ticket: report.id } };
}
