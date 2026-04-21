"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function assignDefaultRoleToUserByEmail(email: string) {
  const defaultRole = await prisma.role.findUnique({
    where: { roleName: "Administrador" },
  });

  if (!defaultRole) {
    throw new Error('No existe el rol "Administrador" en la base de datos.');
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
  await prisma.user.update({
    where: { id: userId },
    data: { roleId },
  });

  revalidatePath("/dashboard/users");
}

export async function deleteUser(userId: string) {
  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath("/dashboard/users");
}