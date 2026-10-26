import type { Metadata } from "next";
import { Suspense } from "react";
import { listUsers, requireUser } from "@/modules/auth";
import { UsersManager } from "@/modules/auth/ui/users-manager";
import { PanelHeader, PanelSkeleton } from "../../_componentes/panel-header";

export const metadata: Metadata = { title: "Usuarios" };

export default function UsuariosPage() {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <Users />
    </Suspense>
  );
}

async function Users() {
  const user = await requireUser("users.manage");
  const users = await listUsers();
  return (
    <>
      <PanelHeader
        title="Usuarios"
        lede="Cuentas del panel. Desactiva las de quienes ya no trabajan en la gerencia: su sesión se cierra al instante."
      />
      <UsersManager users={users} currentUserId={user.id} />
    </>
  );
}
