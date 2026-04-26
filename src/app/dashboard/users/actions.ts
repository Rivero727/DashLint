"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/permissions";
import { ROLE_ADMIN } from "@/lib/roles";

export async function assignDefaultRoleToUserByEmail(email: string) {
  const defaultRole = await prisma.role.findUnique({
    where: { roleName: ROLE_ADMIN },
  });

  if (!defaultRole) {
    throw new Error(`No existe el rol "${ROLE_ADMIN}" en la base de datos.`);
  }

  await prisma.user.update({
    where: { email },
    data: {
      roleId: defaultRole.roleId,
    },
  });

  revalidatePath("/dashboard/users");
}

export async function updateUserRole(userId: string, roleId: number) {
  await requireAdminUser();

  await prisma.user.update({
    where: { id: userId },
    data: { roleId },
  });

  revalidatePath("/dashboard/users");
}

export async function deleteUser(userId: string) {
  await requireAdminUser();

  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath("/dashboard/users");
}
