import "server-only";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { DATA_DIR } from "./paths";

/**
 * Conexión a la base de datos del panel, compartida por todos los módulos.
 *
 * - Con DATABASE_URL (Docker, producción): PostgreSQL.
 * - Sin DATABASE_URL (desarrollo y pruebas): PGlite, un Postgres embebido que guarda en DATA_DIR/pglite.
 *   No hay que instalar nada para trabajar en local.
 *
 * Las migraciones (carpeta drizzle/, generadas con `npm run db:generate`) se aplican solas al abrir la
 * conexión. Cada módulo define sus tablas en su propio server/schema.ts.
 */
export type Db = PgDatabase<PgQueryResultHKT>;

/** La base de datos no está disponible: quien la llama usa sus valores por defecto. */
export class DatabaseUnavailableError extends Error {
  constructor(reason: string) {
    super(`Base de datos no disponible: ${reason}`);
    this.name = "DatabaseUnavailableError";
  }
}

const MIGRATIONS = path.join(process.cwd(), "drizzle");

// En globalThis y no en el módulo: el proxy (src/proxy.ts) se empaqueta aparte y, con PGlite, dos
// conexiones al mismo directorio lo corromperían. Así todo el proceso comparte una.
const store = globalThis as typeof globalThis & { __ggirsDb?: Promise<Db> | null };

export function getDb(): Promise<Db> {
  store.__ggirsDb ??= open().catch((error: unknown) => {
    // se reintenta en la próxima llamada en lugar de quedar roto para siempre
    store.__ggirsDb = null;
    throw error;
  });
  return store.__ggirsDb;
}

async function open(): Promise<Db> {
  const url = process.env.DATABASE_URL;

  if (url) {
    const [{ default: postgres }, { drizzle }, { migrate }] = await Promise.all([
      import("postgres"),
      import("drizzle-orm/postgres-js"),
      import("drizzle-orm/postgres-js/migrator"),
    ]);
    const db = drizzle(postgres(url, { max: 10, onnotice: () => {} }));
    await migrate(db, { migrationsFolder: MIGRATIONS });
    return db;
  }

  // `next build` prerenderiza en varios procesos a la vez y PGlite admite uno solo:
  // durante el build sin Postgres, las páginas se generan con los valores por defecto.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    throw new DatabaseUnavailableError("build sin DATABASE_URL");
  }

  const [{ PGlite }, { drizzle }, { migrate }] = await Promise.all([
    import("@electric-sql/pglite"),
    import("drizzle-orm/pglite"),
    import("drizzle-orm/pglite/migrator"),
  ]);
  // PGlite crea su carpeta, pero no las intermedias
  await mkdir(DATA_DIR, { recursive: true });
  const db = drizzle(new PGlite(path.join(DATA_DIR, "pglite")));
  await migrate(db, { migrationsFolder: MIGRATIONS });
  return db;
}
