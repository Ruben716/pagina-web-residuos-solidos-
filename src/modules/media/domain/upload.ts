import { z } from "zod";

/** Reglas de las imágenes que se suben al panel. Código puro: el navegador las usa para avisar antes de enviar. */

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const MAX_UPLOAD_MB = 15;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;
/** lado mayor de la imagen guardada: suficiente para pantallas grandes y retina */
export const MAX_SIDE = 2400;

const optionalText = (max: number) => z.string().trim().max(max).optional();

export const assetMetaSchema = z.object({
  alt: z
    .string()
    .trim()
    .min(8, "Describe la imagen en al menos 8 caracteres: lo leen las personas ciegas y los buscadores.")
    .max(200, "Máximo 200 caracteres."),
  creditAuthor: optionalText(80),
  creditSource: optionalText(80),
  creditUrl: z.union([z.url("Escribe un enlace completo, que empiece con https://"), z.literal("")]).optional(),
  creditLicense: optionalText(60),
});

export type AssetMeta = z.infer<typeof assetMetaSchema>;

export function checkFile(file: File | null | undefined): string | null {
  if (!file || file.size === 0) return "Elige una imagen.";
  if (!(ACCEPTED_TYPES as readonly string[]).includes(file.type)) return "Sube una imagen JPG, PNG, WebP o AVIF.";
  if (file.size > MAX_UPLOAD_BYTES) return `La imagen pesa más de ${MAX_UPLOAD_MB} MB.`;
  return null;
}
