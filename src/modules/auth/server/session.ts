import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { getDb } from "@/shared/server/db";
import { sessions, users } from "./schema";

const COOKIE = "ggirs_panel";
const TTL_MS = 12 * 60 * 60 * 1000;

const digest = (token: string) => createHash("sha256").update(token).digest("hex");

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: (typeof users.$inferSelect)["role"];
  mustChangePassword: boolean;
}

export async function startSession(userId: string) {
  const db = await getDb();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TTL_MS);
  await db.insert(sessions).values({ id: digest(token), userId, expiresAt });
  // de paso, limpia sesiones vencidas
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" && process.env.PANEL_INSECURE_COOKIE !== "1",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** Usuario de la cookie actual, o null si no hay sesión válida (vencida, cerrada o usuario desactivado). */
export async function readSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  // la vigencia se compara con la hora actual: siempre en el momento de la petición, nunca precalculado
  await connection();
  if (!token) return null;
  const db = await getDb();
  const [row] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      mustChangePassword: users.mustChangePassword,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.id, digest(token)), gt(sessions.expiresAt, new Date()), eq(users.active, true)))
    .limit(1);
  return row ?? null;
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await (await getDb()).delete(sessions).where(eq(sessions.id, digest(token)));
  jar.delete(COOKIE);
}

/** Cierra todas las sesiones de un usuario (al desactivarlo o restablecer su contraseña). */
export async function endSessionsOf(userId: string) {
  await (await getDb()).delete(sessions).where(eq(sessions.userId, userId));
}
