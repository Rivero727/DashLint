import prisma from "@/lib/prisma";

export type RepositoryRow = {
  submitId: number;
  vendor: string;
  name: string;
  clientName: string;
  companyName: string;
  createdAt: string;
};

export async function getRepositories() {
  const submissions = await prisma.submission.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      files: {
        select: {
          fileId: true,
        },
      },
    },
    orderBy: {
      submitId: "asc",
    },
  });

  const formatter = new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const repositories: RepositoryRow[] = submissions.map((submission) => ({
    submitId: submission.submitId,
    vendor: submission.user.name || submission.user.email,
    name: submission.submitName,
    clientName: submission.clientName,
    companyName: submission.companyName,
    createdAt: formatter.format(submission.createdDate),
  }));

  return repositories;
}