import prisma from "@/lib/prisma";

export type DashboardUser = {
  id: string;
  name: string;
};

export type DashboardSubmission = {
  submitId: number;
  submitName: string;
  clientName: string;
  companyName: string;
  createdAt: string;
  vendorId: string;
  vendorName: string;
};

export async function getDashboardData() {
  const [users, submissions] = await Promise.all([
    prisma.user.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.submission.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdDate: "asc",
      },
    }),
  ]);

  const mappedUsers: DashboardUser[] = users.map((user) => ({
    id: user.id,
    name: user.name,
  }));

  const mappedSubmissions: DashboardSubmission[] = submissions.map(
    (submission) => ({
      submitId: submission.submitId,
      submitName: submission.submitName,
      clientName: submission.clientName,
      companyName: submission.companyName,
      createdAt: submission.createdDate.toISOString(),
      vendorId: submission.user.id,
      vendorName: submission.user.name || submission.user.email,
    }),
  );

  return {
    users: mappedUsers,
    submissions: mappedSubmissions,
  };
}