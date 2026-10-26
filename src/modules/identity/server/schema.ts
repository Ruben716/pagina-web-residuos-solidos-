import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Ajustes del sitio como pares clave → JSON. Solo se guarda lo que difiere de los valores de fábrica
 * (definidos en el código), así el sitio funciona igual aunque la tabla esté vacía.
 */
export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  updatedBy: text("updated_by"),
});
