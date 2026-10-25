import { z } from "zod";
import { SPACES } from "./spaces";

export const enrollmentSchema = z.object({
  name: z.string().trim().min(3, "Escribe tu nombre y apellido."),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/\s/g, ""))
    .pipe(z.string().regex(/^9\d{8}$/, "Escribe un celular de 9 dígitos que empiece con 9.")),
  address: z.string().trim().min(5, "Escribe tu dirección para coordinar la entrega del kit."),
  people: z.coerce.number().int().min(1, "Indica cuántas personas viven en tu casa.").max(20),
  space: z.enum(SPACES.map((s) => s.id) as [string, ...string[]], { error: "Elige el espacio que tienes disponible." }),
  commitment: z.literal("on", { error: "Para inscribirte necesitamos tu compromiso de separar los orgánicos." }),
});

export interface Enrollment {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  address: string;
  people: number;
  space: string;
}
