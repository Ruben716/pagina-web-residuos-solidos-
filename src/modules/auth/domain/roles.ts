/** Roles del panel y lo que cada uno puede hacer. Código puro: lo usan servidor y cliente. */

export const ROLES = ["admin", "editor", "fiscalizador"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Administrador",
  editor: "Editor de contenidos",
  fiscalizador: "Fiscalizador",
};

export const ROLE_HINT: Record<Role, string> = {
  admin: "Todo: contenidos, notas de prensa, identidad y colores, imágenes, usuarios e historial.",
  editor: "Contenidos, notas de prensa, imágenes e historial.",
  fiscalizador: "Reportes vecinales (próxima etapa).",
};

export type Permission = "content.edit" | "identity.edit" | "media.edit" | "users.manage" | "audit.view";

const GRANTS: Record<Role, readonly Permission[]> = {
  admin: ["content.edit", "identity.edit", "media.edit", "users.manage", "audit.view"],
  editor: ["content.edit", "media.edit", "audit.view"],
  fiscalizador: [],
};

export const can = (role: Role, permission: Permission) => GRANTS[role].includes(permission);

/** Contraseñas: largas antes que complicadas. */
export const PASSWORD_MIN = 10;
