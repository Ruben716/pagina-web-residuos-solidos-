import "server-only";
import { parseDoc, readContentDoc } from "@/modules/content";
import { FAQ_DEFAULTS, FAQ_KEY, faqSchema } from "../domain/content";

/** Preguntas vigentes: las del panel o, si nunca se editaron, las del código. */
export async function getFaqs() {
  return parseDoc(await readContentDoc(FAQ_KEY), faqSchema, FAQ_DEFAULTS);
}
