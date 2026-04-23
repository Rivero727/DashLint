"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import styles from "@/components/ui/charts.module.css";
import {
  buildVendorChartData,
  getIntervalLabel,
  type DashboardInterval,
  type DashboardSubmission,
  type DashboardUser,
} from "@/lib/dashboard-chart-utils";

type Props = {
  users: DashboardUser[];
  submissions: DashboardSubmission[];
  interval: DashboardInterval;
  selectedVendor?: string | null;
  onVendorSelect?: (vendorName: string) => void;
};

export default function VendorRepos({
  users,
  submissions,
  interval,
  selectedVendor = null,
  onVendorSelect,
}: Props) {
  const { data, series } = useMemo(
    () => buildVendorChartData(submissions, users, interval),
    [submissions, users, interval],
  );

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <h3 className={styles.title}>Repositorios creados por vendedor</h3>
        <p className={styles.chartSubtitle}>
          Agrupado por {getIntervalLabel(interval).toLowerCase()}.
        </p>
      </div>

      {data.length === 0 ? (
        <div className={styles.emptyState}>
          No hay datos para mostrar con los filtros actuales.
        </div>
      ) : (
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e5e7eb"
              />
              <XAxis
                dataKey="period"
                axisLine={{ stroke: "#3BD430", strokeWidth: 1 }}
                tickLine={false}
                tick={{ fill: "#000000", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                allowDecimals={false}
                axisLine={{ stroke: "#3BD430", strokeWidth: 1 }}
                tickLine={false}
                tick={{ fill: "#000000", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "rgba(0, 15, 159, 0.05)" }}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  padding: "10px",
                }}
              />
              <Legend />
              {series.map((item) => (
                <Bar
                  key={item.dataKey}
                  dataKey={item.dataKey}
                  name={item.name}
                  stackId="vendors"
                  fill={item.color}
                  radius={[4, 4, 0, 0]}
                  barSize={38}
                  cursor="pointer"
                  opacity={
                    selectedVendor && selectedVendor !== item.name ? 0.3 : 1
                  }
                  onClick={() => onVendorSelect?.(item.name)}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}