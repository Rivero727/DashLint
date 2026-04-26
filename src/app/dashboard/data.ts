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

type GetDashboardDataParams = {
  userId: string;
  isAdmin: boolean;
};

export async function getDashboardData({
  userId,
  isAdmin,
}: GetDashboardDataParams) {
  const [users, submissions] = await Promise.all([
    prisma.user.findMany({
      where: isAdmin
        ? undefined
        : {
            id: userId,
          },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    }),

    prisma.submission.findMany({
      where: isAdmin
        ? undefined
        : {
            userId,
          },
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
    name: user.name || user.email,
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