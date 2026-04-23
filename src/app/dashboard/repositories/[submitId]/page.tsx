import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import RepoForm from "@/components/_repo-form/repo-form";
import RepoMeta from "@/components/_repo-form/repo-meta";
import styles from "@/components/ui/dashboard.module.css";

type PageProps = {
  params: Promise<{
    submitId: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { submitId: rawSubmitId } = await params;
  const submitId = Number(rawSubmitId);

  if (Number.isNaN(submitId)) {
    notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  });

  const submission = await prisma.submission.findUnique({
    where: { submitId },
    include: {
      user: true,
      files: {
        orderBy: {
          uploadedAt: "desc",
        },
      },
    },
  });

  if (!submission) {
    notFound();
  }

  const isAdmin = currentUser?.role?.roleName === "Administrador";
  const isOwner = submission.userId === session.user.id;

  if (!isAdmin && !isOwner) {
    redirect("/dashboard/repositories");
  }

  const formatter = new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}></header>

      <main className={styles.main}>
        <div className={styles.titleContainer}>
          <div>
            <h1 className={styles.pageTitle}>
              Repositorio #{submission.submitId}
            </h1>
            <p className={styles.subtitle}>
              Visualiza y edita la información del repositorio.
            </p>
          </div>
        </div>

        <RepoMeta
          submitId={submission.submitId}
          createdAt={formatter.format(submission.createdDate)}
          updatedAt={formatter.format(submission.updatedAt)}
          fileCount={submission.files.length}
        />

        <RepoForm
          mode="edit"
          submitId={submission.submitId}
          sellerName={submission.user.name}
          sellerEmail={submission.user.email}
          initialData={{
            submitName: submission.submitName,
            clientName: submission.clientName,
            companyName: submission.companyName,
            description: submission.description ?? "",
            existingFiles: submission.files.map((file) => ({
              fileId: file.fileId,
              fileName: file.fileName,
              filePath: file.filePath,
              fileSize: file.fileSize,
            })),
          }}
        />
      </main>
    </div>
  );
}