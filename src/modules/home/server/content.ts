import "server-only";
import { parseDoc, readContentDoc } from "@/modules/content";
import { SLIDES_DEFAULTS, SLIDES_KEY, slidesSchema } from "../domain/content";

export async function getSlides() {
  return parseDoc(await readContentDoc(SLIDES_KEY), slidesSchema, SLIDES_DEFAULTS);
}
