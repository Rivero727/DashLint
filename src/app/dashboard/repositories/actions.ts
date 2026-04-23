"use server";

import path from "node:path";
import { rm } from "node:fs/promises";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function deleteRepository(submitId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("No autorizado.");
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  });

  const submission = await prisma.submission.findUnique({
    where: { submitId },
    include: {
      files: true,
    },
  });

  if (!submission) {
    throw new Error("Repositorio no encontrado.");
  }

  const isAdmin = currentUser?.role?.roleName === "Administrador";
  const isOwner = submission.userId === session.user.id;

  if (!isAdmin && !isOwner) {
    throw new Error("No tienes permisos para eliminar este repositorio.");
  }

  await prisma.submission.delete({
    where: { submitId },
  });

  await Promise.all(
    submission.files.map((file) =>
      rm(
        path.join(
          process.cwd(),
          "public",
          file.filePath.replace(/^\/+/, ""),
        ),
        { force: true },
      ),
    ),
  );

  revalidatePath("/dashboard/repositories");
  revalidatePath(`/dashboard/repositories/${submitId}`);
}