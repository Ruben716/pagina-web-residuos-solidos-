"use server";

import { z } from "zod";
import { formDataToObject, type FormState } from "@/shared/server/form";
import { createJsonStore } from "@/shared/server/json-store";
import { enrollmentSchema, type Enrollment } from "../domain/compost";

const enrollments = createJsonStore<Enrollment>("compostaje");

export type EnrollFormState = FormState<{ code: string; name: string }>;

export async function enrollCompost(_prev: EnrollFormState, formData: FormData): Promise<EnrollFormState> {
  const parsed = enrollmentSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return { status: "error", errors: z.flattenError(parsed.error).fieldErrors };

  const { name, phone, address, people, space } = parsed.data;
  const code = `COMP-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  await enrollments.insert({ id: code, createdAt: new Date().toISOString(), name, phone, address, people, space });
  return { status: "success", data: { code, name: name.split(" ")[0] } };
}
