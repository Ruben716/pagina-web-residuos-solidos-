"use server";

import { z } from "zod";
import { formDataToObject, type FormState } from "@/shared/server/form";
import { createJsonStore } from "@/shared/server/json-store";

interface Volunteer {
  id: string;
  campaign: string;
  name: string;
  phone: string;
  createdAt: string;
}

const volunteers = createJsonStore<Volunteer>("voluntarios");

const schema = z.object({
  campaign: z.string().min(1),
  name: z.string().trim().min(3, "Escribe tu nombre."),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/\s/g, ""))
    .pipe(z.string().regex(/^9\d{8}$/, "Celular de 9 dígitos que empiece con 9.")),
});

export type JoinState = FormState<{ name: string }>;

export async function joinCampaign(_prev: JoinState, formData: FormData): Promise<JoinState> {
  const parsed = schema.safeParse(formDataToObject(formData));
  if (!parsed.success) return { status: "error", errors: z.flattenError(parsed.error).fieldErrors };
  await volunteers.insert({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...parsed.data });
  return { status: "success", data: { name: parsed.data.name.split(" ")[0] } };
}
