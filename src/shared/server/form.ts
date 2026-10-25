export type FormState<T = undefined> =
  { status: "idle" } | { status: "error"; errors: Record<string, string[] | undefined> } | { status: "success"; data: T };

/** FormData → objeto plano. Los campos vacíos pasan a `undefined` para que Zod aplique sus reglas de opcionales. */
export function formDataToObject(formData: FormData) {
  const out: Record<string, FormDataEntryValue | undefined> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("$ACTION")) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    if (value instanceof File && value.size === 0) continue;
    out[key] = value;
  }
  return out;
}
