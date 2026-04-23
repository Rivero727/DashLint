import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import RepositoryDetailContent from "@/components/_repo-form/repository-detail-content";
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

  return (
    <div className={styles.container}>
      <header className={styles.header}></header>

      <main className={styles.main}>
        <div className={styles.titleContainer}>
          <div>
            <h1 className={styles.pageTitle}>
              Repositorio {submission.submitId}
            </h1>
            <p className={styles.subtitle}>
              Visualiza y edita la información del repositorio.
            </p>
          </div>
        </div>

        <RepositoryDetailContent
          submitId={submission.submitId}
          sellerName={submission.user.name}
          sellerEmail={submission.user.email}
          initialRepository={{
            submitName: submission.submitName,
            clientName: submission.clientName,
            companyName: submission.companyName,
            description: submission.description ?? "",
            createdAt: submission.createdDate.toISOString(),
            updatedAt: submission.updatedAt.toISOString(),
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