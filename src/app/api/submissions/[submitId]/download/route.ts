import { headers } from "next/headers";
import { readFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

function sanitizeZipName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w.\-]/g, "_")
    .replace(/_+/g, "_");
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ submitId: string }> },
) {
  const { submitId: rawSubmitId } = await context.params;
  const submitId = Number(rawSubmitId);

  if (Number.isNaN(submitId)) {
    return new Response("Repositorio inválido.", { status: 400 });
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return new Response("No autorizado.", { status: 401 });
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
    return new Response("Repositorio no encontrado.", { status: 404 });
  }

  const isAdmin = currentUser?.role?.roleName === "Administrador";
  const isOwner = submission.userId === session.user.id;

  if (!isAdmin && !isOwner) {
    return new Response("No tienes permisos para descargar este repositorio.", {
      status: 403,
    });
  }

  if (submission.files.length === 0) {
    return new Response("Este repositorio no tiene archivos para descargar.", {
      status: 404,
    });
  }

  const zip = new JSZip();

  for (const file of submission.files) {
    const absolutePath = path.join(
      process.cwd(),
      "public",
      file.filePath.replace(/^\/+/, ""),
    );

    const fileBuffer = await readFile(absolutePath);
    zip.file(file.fileName, fileBuffer);
  }

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
  const zipBytes = new Uint8Array(zipBuffer);
  const safeRepoName = sanitizeZipName(submission.submitName);

  return new Response(zipBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${safeRepoName}-pdfs.zip"`,
      "Content-Length": String(zipBytes.byteLength),
    },
  });
}