import { openImage } from "@/modules/media";

/**
 * Imágenes subidas desde el panel. El nombre es un UUID nuevo por cada subida (nunca se sobrescribe),
 * así que se pueden cachear para siempre en el navegador y en el optimizador de imágenes.
 */
export async function GET(_req: Request, { params }: RouteContext<"/medios/[file]">) {
  const image = await openImage((await params).file);
  if (!image) return new Response("No encontrado", { status: 404 });
  return new Response(image.body, {
    headers: {
      "Content-Type": "image/webp",
      "Content-Length": String(image.size),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
