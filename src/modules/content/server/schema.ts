import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Colecciones editables desde el panel (preguntas, campañas, carrusel…) guardadas como un documento
 * JSON por clave. Cada módulo valida su documento con su propio esquema; si una clave no tiene fila,
 * el sitio usa los datos de fábrica del código. `version` evita que una edición pise a otra.
 */
export const contentDocs = pgTable("content_docs", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  version: integer("version").notNull().default(1),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  updatedBy: text("updated_by"),
});
