import "server-only";
import { record } from "@/modules/audit";
import { PASSWORD_MIN } from "../domain/roles";
import { hashPassword } from "./password";
import { countUsers, insertInitialAdmin } from "./users";

/**
 * Administrador inicial desde el servidor: si la base no tiene usuarios y están PANEL_ADMIN_EMAIL y
 * PANEL_ADMIN_PASSWORD, se crea solo, con la contraseña marcada como temporal (hay que cambiarla al
 * entrar). Sin esas variables queda la pantalla "Configura el panel" con su código de instalación.
 * Corre una vez por proceso; si falla (base caída), se reintenta en la siguiente visita.
 */
const store = globalThis as typeof globalThis & { __ggirsInitialAdmin?: Promise<void> | null };

export function ensureInitialAdmin(): Promise<void> {
  store.__ggirsInitialAdmin ??= create().catch((error: unknown) => {
    store.__ggirsInitialAdmin = null;
    console.error("[panel] no se pudo crear el administrador inicial:", error);
  });
  return store.__ggirsInitialAdmin;
}

async function create() {
  const email = process.env.PANEL_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.PANEL_ADMIN_PASSWORD ?? "";
  if (!email) return;
  if (password.length < PASSWORD_MIN) {
    console.error(`[panel] PANEL_ADMIN_PASSWORD debe tener al menos ${PASSWORD_MIN} caracteres: no se creó el administrador inicial.`);
    return;
  }
  if ((await countUsers()) > 0) return;

  const name = process.env.PANEL_ADMIN_NAME?.trim() || "Administrador GGIRS";
  const user = await insertInitialAdmin({ name, email, passwordHash: await hashPassword(password) });
  // si otra petición se adelantó, no se crea dos veces
  if (!user) return;
  await record(null, "user.setup", `Se creó el administrador inicial ${email} desde la configuración del servidor`);
  console.info(`[panel] administrador inicial creado: ${email} (debe cambiar la contraseña al entrar)`);
}
