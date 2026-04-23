import { headers } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ submitId: string }> },
) {
  const { submitId: rawSubmitId } = await context.params;
  const submitId = Number(rawSubmitId);

  if (Number.isNaN(submitId)) {
    return NextResponse.json(
      { message: "Repositorio inválido." },
      { status: 400 },
    );
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json(
      { message: "No autorizado." },
      { status: 401 },
    );
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  });

  const submission = await prisma.submission.findUnique({
    where: { submitId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      files: {
        orderBy: {
          uploadedAt: "desc",
        },
      },
    },
  });

  if (!submission) {
    return NextResponse.json(
      { message: "Repositorio no encontrado." },
      { status: 404 },
    );
  }

  const isAdmin = currentUser?.role?.roleName === "Administrador";
  const isOwner = submission.userId === session.user.id;

  if (!isAdmin && !isOwner) {
    return NextResponse.json(
      { message: "No tienes permisos para ver este repositorio." },
      { status: 403 },
    );
  }

  return NextResponse.json({
    repository: {
      submitId: submission.submitId,
      submitName: submission.submitName,
      clientName: submission.clientName,
      companyName: submission.companyName,
      description: submission.description ?? "",
      createdAt: submission.createdDate.toISOString(),
      updatedAt: submission.updatedAt.toISOString(),
      vendorName: submission.user.name || submission.user.email,
      vendorEmail: submission.user.email,
      files: submission.files.map((file) => ({
        fileId: file.fileId,
        fileName: file.fileName,
        filePath: file.filePath,
        fileSize: file.fileSize,
      })),
    },
  });
}