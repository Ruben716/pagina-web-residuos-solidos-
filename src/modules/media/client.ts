/**
 * API pública del módulo para componentes de cliente de OTROS módulos (index.ts reexporta código de
 * servidor y no se puede importar desde el navegador).
 */
export type { ImageChoice } from "./domain/refs";
export { ImagePicker } from "./ui/image-picker";
