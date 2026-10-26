import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/** Imágenes subidas desde el panel. El archivo vive en el almacenamiento (ver storage.ts). */
export const mediaAssets = pgTable("media_assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** nombre del archivo en el almacenamiento, p. ej. "3f2c….webp" */
  file: text("file").notNull().unique(),
  originalName: text("original_name").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  bytes: integer("bytes").notNull(),
  alt: text("alt").notNull(),
  creditAuthor: text("credit_author"),
  creditSource: text("credit_source"),
  creditUrl: text("credit_url"),
  creditLicense: text("credit_license"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  createdBy: text("created_by"),
});

/**
 * Qué imagen ocupa cada espacio del sitio. La clave es la del registro MEDIA (p. ej. "recoleccionSelectiva");
 * si un espacio no tiene fila, se usa la imagen de fábrica.
 */
export const mediaSlots = pgTable("media_slots", {
  slot: text("slot").primaryKey(),
  assetId: uuid("asset_id")
    .notNull()
    .references(() => mediaAssets.id, { onDelete: "restrict" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  updatedBy: text("updated_by"),
});

export type AssetRow = typeof mediaAssets.$inferSelect;
