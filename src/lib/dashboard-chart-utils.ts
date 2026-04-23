export type DashboardInterval = "day" | "week" | "month" | "year";

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

type VendorSeries = {
  dataKey: string;
  name: string;
  color: string;
};

export type DashboardStats = {
  totalRepositories: number;
  topVendor: string;
  repositoriesThisMonth: number;
  topClient: string;
};

export type SummaryChartRow = {
  period: string;
  periodKey: string;
  total: number;
};

const COLORS = [
  "#000f9f",
  "#38d430",
  "#06b6d4",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#14b8a6",
  "#6366f1",
  "#84cc16",
  "#ec4899",
];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function getStartOfWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function getPeriodKey(date: Date, interval: DashboardInterval) {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  if (interval === "day") {
    return `${year}-${month}-${day}`;
  }

  if (interval === "week") {
    const weekStart = getStartOfWeek(date);
    return `${weekStart.getFullYear()}-${pad(weekStart.getMonth() + 1)}-${pad(weekStart.getDate())}`;
  }

  if (interval === "month") {
    return `${year}-${month}`;
  }

  return `${year}`;
}

export function formatPeriodLabel(key: string, interval: DashboardInterval) {
  if (interval === "day") {
    const [year, month, day] = key.split("-");
    return `${day}/${month}/${year}`;
  }

  if (interval === "week") {
    const [year, month, day] = key.split("-");
    return `Semana ${day}/${month}/${year}`;
  }

  if (interval === "month") {
    const [year, month] = key.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);

    return new Intl.DateTimeFormat("es-MX", {
      month: "short",
      year: "numeric",
    }).format(date);
  }

  return key;
}

export function getIntervalLabel(interval: DashboardInterval) {
  switch (interval) {
    case "day":
      return "Días";
    case "week":
      return "Semanas";
    case "month":
      return "Meses";
    case "year":
      return "Años";
    default:
      return "Meses";
  }
}

export function submissionMatchesPeriod(
  submission: DashboardSubmission,
  interval: DashboardInterval,
  periodKey: string,
) {
  return getPeriodKey(new Date(submission.createdAt), interval) === periodKey;
}

export function buildSummaryChartData(
  submissions: DashboardSubmission[],
  interval: DashboardInterval,
): SummaryChartRow[] {
  const grouped = new Map<string, number>();

  for (const submission of submissions) {
    const date = new Date(submission.createdAt);
    const key = getPeriodKey(date, interval);

    grouped.set(key, (grouped.get(key) ?? 0) + 1);
  }

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, total]) => ({
      period: formatPeriodLabel(key, interval),
      periodKey: key,
      total,
    }));
}

export function buildVendorChartData(
  submissions: DashboardSubmission[],
  users: DashboardUser[],
  interval: DashboardInterval,
) {
  const grouped = new Map<string, Record<string, string | number>>();
  const userTotals = new Map<string, number>();

  for (const user of users) {
    userTotals.set(user.id, 0);
  }

  for (const submission of submissions) {
    const date = new Date(submission.createdAt);
    const key = getPeriodKey(date, interval);

    if (!grouped.has(key)) {
      grouped.set(key, {
        period: formatPeriodLabel(key, interval),
      });
    }

    const row = grouped.get(key)!;
    const currentValue = Number(row[submission.vendorId] ?? 0);

    row[submission.vendorId] = currentValue + 1;
    userTotals.set(
      submission.vendorId,
      (userTotals.get(submission.vendorId) ?? 0) + 1,
    );
  }

  const activeUsers = users.filter((user) => (userTotals.get(user.id) ?? 0) > 0);

  const data = Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, row]) => {
      const normalizedRow: Record<string, string | number> = {
        period: row.period,
      };

      for (const user of activeUsers) {
        normalizedRow[user.id] = Number(row[user.id] ?? 0);
      }

      return normalizedRow;
    });

  const series: VendorSeries[] = activeUsers.map((user, index) => ({
    dataKey: user.id,
    name: user.name,
    color: COLORS[index % COLORS.length],
  }));

  return {
    data,
    series,
  };
}

export function buildDashboardStats(
  submissions: DashboardSubmission[],
): DashboardStats {
  const totalRepositories = submissions.length;

  const vendorCountMap = new Map<string, number>();
  const clientCountMap = new Map<string, number>();

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let repositoriesThisMonth = 0;

  for (const submission of submissions) {
    vendorCountMap.set(
      submission.vendorName,
      (vendorCountMap.get(submission.vendorName) ?? 0) + 1,
    );

    clientCountMap.set(
      submission.clientName,
      (clientCountMap.get(submission.clientName) ?? 0) + 1,
    );

    const createdAt = new Date(submission.createdAt);

    if (
      createdAt.getMonth() === currentMonth &&
      createdAt.getFullYear() === currentYear
    ) {
      repositoriesThisMonth += 1;
    }
  }

  let topVendor = "Sin datos";
  let topVendorCount = 0;

  for (const [vendorName, count] of vendorCountMap.entries()) {
    if (count > topVendorCount) {
      topVendor = vendorName;
      topVendorCount = count;
    }
  }

  let topClient = "Sin datos";
  let topClientCount = 0;

  for (const [clientName, count] of clientCountMap.entries()) {
    if (count > topClientCount) {
      topClient = clientName;
      topClientCount = count;
    }
  }

  return {
    totalRepositories,
    topVendor,
    repositoriesThisMonth,
    topClient,
  };
}