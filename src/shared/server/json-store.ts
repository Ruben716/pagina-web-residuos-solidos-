import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), ".data");

/**
 * Almacén JSON mínimo para el monolito. Guarda en disco (`.data/`) y, si el sistema de
 * archivos es de sólo lectura (p. ej. serverless), mantiene los datos en memoria.
 * Para producción se reemplaza por un repositorio con base de datos con la misma interfaz.
 */
export interface Store<T extends { id: string }> {
  all(): Promise<T[]>;
  get(id: string): Promise<T | undefined>;
  insert(item: T): Promise<T>;
}

const memory = new Map<string, unknown[]>();

export function createJsonStore<T extends { id: string }>(name: string): Store<T> {
  const file = path.join(DATA_DIR, `${name}.json`);
  let queue = Promise.resolve();

  async function load(): Promise<T[]> {
    if (memory.has(name)) return memory.get(name) as T[];
    try {
      const data = JSON.parse(await readFile(file, "utf8")) as T[];
      memory.set(name, data);
      return data;
    } catch {
      memory.set(name, []);
      return [];
    }
  }

  async function persist(items: T[]) {
    memory.set(name, items);
    try {
      await mkdir(DATA_DIR, { recursive: true });
      await writeFile(file, JSON.stringify(items, null, 2));
    } catch (error) {
      console.warn(`[json-store] ${name}: sin escritura en disco, se conserva en memoria`, error);
    }
  }

  return {
    all: load,
    async get(id) {
      return (await load()).find((item) => item.id === id);
    },
    insert(item) {
      // serializa escrituras concurrentes
      const run = queue.then(async () => {
        const items = await load();
        await persist([item, ...items]);
        return item;
      });
      queue = run.then(
        () => undefined,
        () => undefined,
      );
      return run;
    },
  };
}

export async function saveUpload(folder: string, file: File): Promise<string | null> {
  try {
    const dir = path.join(DATA_DIR, "uploads", folder);
    await mkdir(dir, { recursive: true });
    const ext = file.type.split("/")[1]?.replace(/[^a-z0-9]/g, "") || "bin";
    const name = `${crypto.randomUUID()}.${ext}`;
    await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
    return name;
  } catch {
    return null;
  }
}
