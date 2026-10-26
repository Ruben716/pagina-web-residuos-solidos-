import { defineConfig } from "drizzle-kit";

// Cada módulo es dueño de sus tablas (src/modules/<módulo>/server/schema.ts).
// `npm run db:generate` compara con las migraciones de drizzle/ y escribe la siguiente;
// la aplicación las ejecuta sola al conectarse (src/shared/server/db.ts).
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/modules/*/server/schema.ts",
  out: "./drizzle",
});
