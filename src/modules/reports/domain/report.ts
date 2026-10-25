import { z } from "zod";

export const REPORT_TYPES = [
  { id: "esquina", label: "Basura en esquina fuera de horario", hint: "Bolsas dejadas en la calle cuando el camión ya pasó." },
  { id: "desmonte", label: "Desmonte o escombros en la vía pública", hint: "Restos de construcción en veredas, calles o terrenos." },
  { id: "botadero", label: "Punto crítico o botadero clandestino", hint: "Acumulación grande y recurrente de residuos." },
  { id: "contenedor", label: "Contenedor o papelera colapsada", hint: "Un contenedor municipal lleno o dañado." },
  { id: "omision", label: "El camión no pasó por mi calle", hint: "Omisión de recojo en el horario programado." },
] as const;

export type ReportTypeId = (typeof REPORT_TYPES)[number]["id"];

export const BARRIOS = [
  "Cercado de Puno",
  "Laykakota",
  "Huajsapata",
  "Bellavista",
  "Barrio Porteño",
  "Mañazo",
  "Alto Puno",
  "Yanamayo",
  "Ciudad Universitaria",
  "Machallata",
  "Salcedo",
  "Jayllihuaya",
  "Chanu Chanu",
  "Huáscar",
  "Ricardo Palma",
  "Otro",
] as const;

const MAX_PHOTO = 5 * 1024 * 1024;

export const reportSchema = z
  .object({
    type: z.enum(REPORT_TYPES.map((t) => t.id) as [ReportTypeId, ...ReportTypeId[]], {
      error: "Elige qué tipo de problema quieres reportar.",
    }),
    barrio: z.enum(BARRIOS, { error: "Elige el barrio o sector." }),
    address: z.string().trim().min(5, "Escribe la dirección o una referencia de al menos 5 caracteres."),
    lat: z.coerce.number().min(-16.2).max(-15.5).optional(),
    lng: z.coerce.number().min(-70.4).max(-69.7).optional(),
    route: z.string().optional(),
    description: z.string().trim().min(15, "Describe el problema en al menos 15 caracteres: qué ves y desde cuándo."),
    photo: z
      .instanceof(File)
      .optional()
      .refine((f) => !f || f.size === 0 || f.type.startsWith("image/"), "La evidencia debe ser una imagen (JPG, PNG o WebP).")
      .refine((f) => !f || f.size <= MAX_PHOTO, "La foto pesa más de 5 MB. Toma otra con menor resolución."),
    anonymous: z.coerce.boolean().default(false),
    name: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    email: z.union([z.literal(""), z.email("Revisa el correo: falta la @ o el dominio.")]).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.anonymous) return;
    if (!data.name || data.name.length < 3)
      ctx.addIssue({ code: "custom", path: ["name"], message: "Escribe tu nombre o marca el reporte como anónimo." });
    if (!data.phone || !/^9\d{8}$/.test(data.phone.replace(/\s/g, "")))
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Escribe un celular de 9 dígitos que empiece con 9." });
  });

export type ReportInput = z.infer<typeof reportSchema>;

export type ReportStatus = "recibido" | "en-inspeccion" | "programado" | "atendido";

export const STATUS_STEPS: readonly { id: ReportStatus; label: string; detail: string }[] = [
  { id: "recibido", label: "Recibido", detail: "Tu reporte llegó a la central de la GGIRS." },
  { id: "en-inspeccion", label: "En inspección", detail: "Un fiscalizador verifica el punto en campo." },
  { id: "programado", label: "Limpieza programada", detail: "Se asigna una cuadrilla o una unidad de recojo." },
  { id: "atendido", label: "Atendido", detail: "El punto quedó limpio. Te avisamos si dejaste un contacto." },
];

export interface CitizenReport {
  id: string;
  createdAt: string;
  status: ReportStatus;
  type: ReportTypeId;
  barrio: string;
  address: string;
  lat?: number;
  lng?: number;
  route?: string;
  description: string;
  photo?: string | null;
  anonymous: boolean;
  contact?: { name?: string; phone?: string; email?: string };
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Código legible por teléfono: MPP-2610-K7QD (año+mes y cuatro caracteres sin ambigüedad). */
export function createTicket(date = new Date()) {
  const ym = `${String(date.getFullYear()).slice(2)}${String(date.getMonth() + 1).padStart(2, "0")}`;
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  const code = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
  return `MPP-${ym}-${code}`;
}

export const TICKET_PATTERN = /^MPP-\d{4}-[A-Z2-9]{4}$/;
