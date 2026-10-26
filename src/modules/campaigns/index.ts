import { cacheLife } from "next/cache";
import { formatDate } from "@/shared/lib/format";
import type { Campaign } from "./data";
import type { CampaignRow } from "./ui/campaign-index";

export type { Campaign } from "./data";
export { CAMPAIGNS_DEFAULTS, CAMPAIGNS_KEY, CAMPAIGNS_VIEW, campaignsSchema } from "./domain/content";
export { getCampaigns } from "./server/content";
export { CampaignIndex } from "./ui/campaign-index";

/**
 * Campañas separadas en próximas y realizadas, con sus fechas ya formateadas. Se recalcula cada hora;
 * las campañas llegan como argumento (getCampaigns()), así un cambio en el panel genera otra entrada de caché.
 */
export async function getCampaignRows(campaigns: readonly Campaign[]) {
  "use cache";
  cacheLife("hours");
  const now = Date.now();
  // sin la foto: la página la agrega con las imágenes vigentes del panel
  const rows: Omit<CampaignRow, "media">[] = campaigns.map((c) => ({
    ...c,
    past: new Date(c.end ?? c.start).getTime() < now,
    when: {
      day: formatDate(c.start, { day: "2-digit" }),
      month: formatDate(c.start, { month: "long" }),
      weekday: formatDate(c.start, { weekday: "long" }),
      hours: [c.start, c.end]
        .filter(Boolean)
        .map((d) => formatDate(d!, { hour: "numeric", minute: "2-digit" }))
        .join(" a "),
    },
  }));
  return {
    upcoming: rows.filter((r) => !r.past).toSorted((a, b) => a.start.localeCompare(b.start)),
    past: rows.filter((r) => r.past).toSorted((a, b) => b.start.localeCompare(a.start)),
  };
}
