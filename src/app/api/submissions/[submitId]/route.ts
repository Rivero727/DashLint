import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_FILES = 10;
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

function sanitizeFileName(fileName: string) {
  return fileName
    .normalize("NFKD")
    .replace(/[^\w.\-]/g, "_")
    .replace(/_+/g, "_");
}

function isPdfFile(file: File) {
  const lowerName = file.name.toLowerCase();
  return file.type === "application/pdf" || lowerName.endsWith(".pdf");
}

export async function PUT(
  request: Request,
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
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json(
      { message: "No autorizado. Inicia sesión para continuar." },
      { status: 401 },
    );
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  });

  const existingSubmission = await prisma.submission.findUnique({
    where: { submitId },
    include: {
      files: true,
    },
  });

  if (!existingSubmission) {
    return NextResponse.json(
      { message: "Repositorio no encontrado." },
      { status: 404 },
    );
  }

  const isAdmin = currentUser?.role?.roleName === "Administrador";
  const isOwner = existingSubmission.userId === session.user.id;

  if (!isAdmin && !isOwner) {
    return NextResponse.json(
      { message: "No tienes permisos para editar este repositorio." },
      { status: 403 },
    );
  }

  const formData = await request.formData();

  const submitName = String(formData.get("submitName") ?? "").trim();
  const clientName = String(formData.get("clientName") ?? "").trim();
  const companyName = String(formData.get("companyName") ?? "").trim();
  const descriptionRaw = String(formData.get("description") ?? "").trim();
  const description = descriptionRaw || null;

  const removedFileIds = formData
    .getAll("removedFileIds")
    .map((value) => Number(value))
    .filter((value) => !Number.isNaN(value));

  const newFiles = formData
    .getAll("files")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (!submitName || !clientName || !companyName) {
    return NextResponse.json(
      { message: "Completa todos los campos obligatorios." },
      { status: 400 },
    );
  }

  if (newFiles.length > MAX_FILES) {
    return NextResponse.json(
      { message: `Solo puedes subir hasta ${MAX_FILES} archivos PDF por edición.` },
      { status: 400 },
    );
  }

  for (const file of newFiles) {
    if (!isPdfFile(file)) {
      return NextResponse.json(
        { message: `El archivo "${file.name}" no es un PDF válido.` },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          message: `El archivo "${file.name}" supera el límite de ${MAX_FILE_SIZE_MB} MB.`,
        },
        { status: 400 },
      );
    }
  }

  const filesToRemove = existingSubmission.files.filter((file) =>
    removedFileIds.includes(file.fileId),
  );

  const remainingFilesCount =
    existingSubmission.files.length - filesToRemove.length + newFiles.length;

  if (remainingFilesCount <= 0) {
    return NextResponse.json(
      {
        message:
          "El repositorio debe conservar al menos un archivo PDF asociado.",
      },
      { status: 400 },
    );
  }

  const relativeFolder = path.posix.join(
    "uploads",
    "submissions",
    String(submitId),
  );
  const absoluteFolder = path.join(process.cwd(), "public", relativeFolder);

  const savedFiles: Array<{
    fileName: string;
    filePath: string;
    fileSize: number;
  }> = [];

  try {
    if (newFiles.length > 0) {
      await mkdir(absoluteFolder, { recursive: true });

      for (const file of newFiles) {
        const safeName = sanitizeFileName(file.name);
        const storedName = `${Date.now()}-${randomUUID()}-${safeName}`;
        const absoluteFilePath = path.join(absoluteFolder, storedName);
        const publicFilePath = `/${relativeFolder}/${storedName}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        await writeFile(absoluteFilePath, buffer);

        savedFiles.push({
          fileName: file.name,
          filePath: publicFilePath,
          fileSize: file.size,
        });
      }
    }

    const updatedSubmission = await prisma.$transaction(async (tx) => {
      await tx.client.upsert({
        where: { clientName },
        update: {},
        create: { clientName },
      });

      await tx.company.upsert({
        where: { companyName },
        update: {},
        create: { companyName },
      });

      await tx.submission.update({
        where: { submitId },
        data: {
          submitName,
          clientName,
          companyName,
          description,
        },
      });

      if (removedFileIds.length > 0) {
        await tx.submissionFile.deleteMany({
          where: {
            submitId,
            fileId: {
              in: removedFileIds,
            },
          },
        });
      }

      if (savedFiles.length > 0) {
        await tx.submissionFile.createMany({
          data: savedFiles.map((file) => ({
            fileName: file.fileName,
            filePath: file.filePath,
            fileSize: file.fileSize,
            submitId,
          })),
        });
      }

      return tx.submission.findUnique({
        where: { submitId },
        include: {
          files: {
            orderBy: {
              uploadedAt: "desc",
            },
          },
        },
      });
    });

    await Promise.all(
      filesToRemove.map((file) =>
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

    return NextResponse.json(
      {
        message: "Repositorio actualizado correctamente.",
        submitId,
        files:
          updatedSubmission?.files.map((file) => ({
            fileId: file.fileId,
            fileName: file.fileName,
            filePath: file.filePath,
            fileSize: file.fileSize,
          })) ?? [],
      },
      { status: 200 },
    );
  } catch (error) {
    await Promise.all(
      savedFiles.map((file) =>
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

    console.error("Error actualizando repositorio:", error);

    return NextResponse.json(
      { message: "No fue posible actualizar el repositorio." },
      { status: 500 },
    );
  }
}