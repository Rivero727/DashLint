import prisma from "@/lib/prisma";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId: number | null;
  status: "Activo" | "Inactivo";
};

export type RoleOption = {
  roleId: number;
  roleName: string;
};

export async function getUsersAndRoles() {
  const [users, roles] = await Promise.all([
    prisma.user.findMany({
      include: {
        role: true,
        sessions: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.role.findMany({
      orderBy: {
        roleName: "asc",
      },
    }),
  ]);

  const now = new Date();

  const mappedUsers: UserRow[] = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role?.roleName ?? "Sin rol",
    roleId: user.roleId ?? null,
    status: user.sessions.some((session) => session.expiresAt > now)
      ? "Activo"
      : "Inactivo",
  }));

  const mappedRoles: RoleOption[] = roles.map((role) => ({
    roleId: role.roleId,
    roleName: role.roleName,
  }));

  return {
    users: mappedUsers,
    roles: mappedRoles,
  };
}