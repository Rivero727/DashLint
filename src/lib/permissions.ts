import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ROLE_ADMIN, ROLE_SELLER } from "@/lib/roles";

export function isAdminRole(roleName?: string | null) {
  return roleName === ROLE_ADMIN;
}

export function isSellerRole(roleName?: string | null) {
  return roleName === ROLE_SELLER;
}

export async function getCurrentUserWithRole() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      role: true,
    },
  });

  if (!currentUser) {
    redirect("/login");
  }

  return currentUser;
}

export async function requireAdminUser() {
  const currentUser = await getCurrentUserWithRole();

  if (!isAdminRole(currentUser.role?.roleName)) {
    redirect("/dashboard");
  }

  return currentUser;
}