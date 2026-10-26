import "server-only";
import { parseDoc, readContentDoc } from "@/modules/content";
import { CAMPAIGNS_DEFAULTS, CAMPAIGNS_KEY, campaignsSchema } from "../domain/content";

/** Campañas vigentes: las del panel o, si nunca se editaron, las del código. */
export async function getCampaigns() {
  return parseDoc(await readContentDoc(CAMPAIGNS_KEY), campaignsSchema, CAMPAIGNS_DEFAULTS);
}
