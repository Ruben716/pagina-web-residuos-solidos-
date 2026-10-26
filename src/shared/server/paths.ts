import "server-only";
import path from "node:path";

/** Carpeta de datos del servidor: JSON de formularios, PGlite e imágenes subidas. En Docker es un volumen. */
export const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), ".data");
