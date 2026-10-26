import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Historial de cambios del panel. Guarda nombre y correo del autor como texto (no como referencia),
 * para que el registro sobreviva aunque el usuario se elimine.
 */
export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id"),
    actorName: text("actor_name").notNull(),
    /** p. ej. "identity.update", "media.upload", "user.create" */
    action: text("action").notNull(),
    summary: text("summary").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("audit_created_idx").on(t.createdAt)],
);

export type AuditRow = typeof auditLog.$inferSelect;
