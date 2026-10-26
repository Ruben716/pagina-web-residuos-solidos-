import { cn } from "@/shared/lib/cn";
import { Icon, type IconName } from "@/shared/ui/icon";
import type { FacebookPost } from "../types";
import { kindOf } from "./post-text";

/** Color por tipo, como las etiquetas de las notas del PNUMA: se distingue de un vistazo qué es cada publicación. */
function styleOf(p: FacebookPost): { icon: IconName; className: string } {
  if (p.video) return { icon: "play", className: "bg-brote text-noche" };
  if (p.photos.length > 1) return { icon: "camera", className: "bg-celeste-200 text-puno-800" };
  if (p.photos.length) return { icon: "camera", className: "bg-white text-puno-800" };
  return { icon: "info", className: "bg-inti text-noche" };
}

export function KindTag({ post, className }: { post: FacebookPost; className?: string }) {
  const { icon, className: color } = styleOf(post);
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold shadow-sm", color, className)}>
      <Icon name={icon} size={13} />
      {kindOf(post)}
    </span>
  );
}
