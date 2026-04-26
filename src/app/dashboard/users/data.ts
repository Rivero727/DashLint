import prisma from "@/lib/prisma";

export type UserRow = {
  id: string;
  userNumber: number;
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

export async function getUsersAndRoles(search?: string) {
  const searchTerm = search?.trim();
  const numericSearch = searchTerm ? Number(searchTerm) : NaN;

  const [users, roles] = await Promise.all([
    prisma.user.findMany({
      where: searchTerm
        ? {
            OR: [
              {
                name: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
              {
                role: {
                  roleName: {
                    contains: searchTerm,
                    mode: "insensitive",
                  },
                },
              },
              ...(Number.isInteger(numericSearch)
                ? [
                    {
                      userNumber: numericSearch,
                    },
                  ]
                : []),
            ],
          }
        : undefined,
      include: {
        role: true,
        sessions: true,
      },
      orderBy: {
        userNumber: "asc",
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
    userNumber: user.userNumber,
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