import "server-only";
import { desc } from "drizzle-orm";
import { getDb } from "@/shared/server/db";
import { auditLog } from "./schema";

interface Actor {
  id: string;
  name: string;
}

/** Deja constancia de un cambio. Un fallo al registrar no debe deshacer el cambio, así que no lanza. */
export async function record(actor: Actor | null, action: string, summary: string) {
  try {
    await (await getDb()).insert(auditLog).values({ actorId: actor?.id, actorName: actor?.name ?? "Sistema", action, summary });
  } catch (error) {
    console.error("[audit] no se pudo registrar:", action, error);
  }
}

export async function recentChanges(limit = 100) {
  return (await getDb()).select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(limit);
}
