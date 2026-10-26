import { date, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/** Notas de prensa. Las borradores solo se ven en el panel; `version` evita que una edición pise a otra. */
export const newsArticles = pgTable(
  "news_articles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull(),
    body: text("body").notNull(),
    category: text("category").notNull(),
    image: text("image").notNull(),
    date: date("date", { mode: "string" }).notNull(),
    sourceLabel: text("source_label"),
    sourceUrl: text("source_url"),
    status: text("status").notNull().default("draft"),
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    updatedBy: text("updated_by"),
  },
  (t) => [index("news_articles_status_date_idx").on(t.status, t.date)],
);

export type NewsRow = typeof newsArticles.$inferSelect;
