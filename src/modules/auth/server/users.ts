import "server-only";
import { and, asc, count, eq } from "drizzle-orm";
import { getDb } from "@/shared/server/db";
import type { Role } from "../domain/roles";
import { users } from "./schema";

/** Acceso a la tabla de usuarios. Nunca devuelve el hash de la contraseña salvo en findForLogin. */

const PUBLIC = {
  id: users.id,
  name: users.name,
  email: users.email,
  role: users.role,
  active: users.active,
  mustChangePassword: users.mustChangePassword,
  createdAt: users.createdAt,
  lastLoginAt: users.lastLoginAt,
};

export type PanelUser = Awaited<ReturnType<typeof listUsers>>[number];

export async function countUsers() {
  const [row] = await (await getDb()).select({ n: count() }).from(users);
  return row.n;
}

export async function listUsers() {
  return (await getDb()).select(PUBLIC).from(users).orderBy(asc(users.name));
}

export async function findUser(id: string) {
  const [row] = await (await getDb()).select(PUBLIC).from(users).where(eq(users.id, id)).limit(1);
  return row;
}

export async function findForLogin(email: string) {
  const [row] = await (await getDb()).select().from(users).where(eq(users.email, email)).limit(1);
  return row;
}

export async function passwordHashOf(id: string) {
  const [row] = await (await getDb()).select({ hash: users.passwordHash }).from(users).where(eq(users.id, id)).limit(1);
  return row?.hash;
}

export async function insertUser(values: { name: string; email: string; role: Role; passwordHash: string; mustChangePassword: boolean }) {
  const [row] = await (await getDb()).insert(users).values(values).returning(PUBLIC);
  return row;
}

export async function updateUser(id: string, values: Partial<typeof users.$inferInsert>) {
  await (await getDb()).update(users).set(values).where(eq(users.id, id));
}

export async function countActiveAdmins() {
  const [row] = await (
    await getDb()
  )
    .select({ n: count() })
    .from(users)
    .where(and(eq(users.role, "admin"), eq(users.active, true)));
  return row.n;
}
