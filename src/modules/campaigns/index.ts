import { cacheLife } from "next/cache";
import { MEDIA } from "@/shared/content/media";
import { formatDate } from "@/shared/lib/format";
import { CAMPAIGNS } from "./data";
import type { CampaignRow } from "./ui/campaign-index";

export type { Campaign } from "./data";
export { CampaignIndex } from "./ui/campaign-index";

/** Campañas separadas en próximas y realizadas. Se recalcula cada hora. */
export async function getCampaignRows() {
  "use cache";
  cacheLife("hours");
  const now = Date.now();
  const rows: CampaignRow[] = CAMPAIGNS.map((c) => ({
    ...c,
    media: MEDIA[c.image],
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
