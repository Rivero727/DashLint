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

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json(
      { message: "No autorizado. Inicia sesión para continuar." },
      { status: 401 },
    );
  }

  const formData = await request.formData();

  const submitName = String(formData.get("submitName") ?? "").trim();
  const clientName = String(formData.get("clientName") ?? "").trim();
  const companyName = String(formData.get("companyName") ?? "").trim();
  const descriptionRaw = String(formData.get("description") ?? "").trim();
  const description = descriptionRaw || null;

  const files = formData
    .getAll("files")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (!submitName || !clientName || !companyName) {
    return NextResponse.json(
      { message: "Completa todos los campos obligatorios." },
      { status: 400 },
    );
  }

  if (files.length === 0) {
    return NextResponse.json(
      { message: "Debes subir al menos un archivo PDF." },
      { status: 400 },
    );
  }

  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { message: `Solo puedes subir hasta ${MAX_FILES} archivos PDF.` },
      { status: 400 },
    );
  }

  for (const file of files) {
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

  const folderId = `${Date.now()}-${randomUUID()}`;
  const relativeFolder = path.posix.join("uploads", "submissions", folderId);
  const absoluteFolder = path.join(process.cwd(), "public", relativeFolder);

  try {
    await mkdir(absoluteFolder, { recursive: true });

    const savedFiles: Array<{
      fileName: string;
      filePath: string;
      fileSize: number;
    }> = [];

    for (const file of files) {
      const safeName = sanitizeFileName(file.name);
      const storedName = `${Date.now()}-${randomUUID()}-${safeName}`;
      const absoluteFilePath = path.join(absoluteFolder, storedName);
      const publicFilePath = `/${relativeFolder.replace(/\\/g, "/")}/${storedName}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      await writeFile(absoluteFilePath, buffer);

      savedFiles.push({
        fileName: file.name,
        filePath: publicFilePath,
        fileSize: file.size,
      });
    }

    const submission = await prisma.$transaction(async (tx) => {
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

      const createdSubmission = await tx.submission.create({
        data: {
          submitName,
          clientName,
          companyName,
          description,
          userId: session.user.id,
        },
      });

      await tx.submissionFile.createMany({
        data: savedFiles.map((file) => ({
          fileName: file.fileName,
          filePath: file.filePath,
          fileSize: file.fileSize,
          submitId: createdSubmission.submitId,
        })),
      });

      return createdSubmission;
    });

    return NextResponse.json(
      {
        message: "Repositorio creado correctamente.",
        submitId: submission.submitId,
      },
      { status: 201 },
    );
  } catch (error) {
    await rm(absoluteFolder, { recursive: true, force: true });

    console.error("Error creando repositorio:", error);

    return NextResponse.json(
      { message: "No fue posible crear el repositorio." },
      { status: 500 },
    );
  }
}
