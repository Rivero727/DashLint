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
  Cell,
} from "recharts";
import styles from "@/components/ui/charts.module.css";
import {
  buildSummaryChartData,
  getIntervalLabel,
  type DashboardInterval,
  type DashboardSubmission,
} from "@/lib/dashboard-chart-utils";

type Props = {
  submissions: DashboardSubmission[];
  interval: DashboardInterval;
  selectedPeriodKey?: string | null;
  onPeriodSelect?: (periodKey: string, label: string) => void;
};

export default function SummaryChart({
  submissions,
  interval,
  selectedPeriodKey = null,
  onPeriodSelect,
}: Props) {
  const data = useMemo(
    () => buildSummaryChartData(submissions, interval),
    [submissions, interval],
  );

  const handleBarClick = (_: unknown, index: number) => {
    const row = data[index];

    if (!row) return;

    onPeriodSelect?.(row.periodKey, row.period);
  };

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <h3 className={styles.title}>Resumen general de repositorios</h3>
        <p className={styles.chartSubtitle}>
          Total agrupado por {getIntervalLabel(interval).toLowerCase()}.
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
              <defs>
                <linearGradient
                  id="summaryBarGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#000f9f" stopOpacity={1} />
                  <stop offset="100%" stopColor="#000f9f" stopOpacity={0.3} />
                </linearGradient>

                <linearGradient
                  id="summaryBarGradientActive"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#38d430" stopOpacity={1} />
                  <stop offset="100%" stopColor="#38d430" stopOpacity={0.35} />
                </linearGradient>
              </defs>

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
                itemStyle={{ color: "#000f9f", fontWeight: "bold" }}
                labelStyle={{ color: "#000000", marginBottom: "4px" }}
              />
              <Bar
                dataKey="total"
                radius={[8, 8, 0, 0]}
                barSize={35}
                cursor="pointer"
                onClick={handleBarClick}
              >
                {data.map((row) => (
                  <Cell
                    key={row.periodKey}
                    fill={
                      selectedPeriodKey === row.periodKey
                        ? "url(#summaryBarGradientActive)"
                        : "url(#summaryBarGradient)"
                    }
                    opacity={
                      selectedPeriodKey && selectedPeriodKey !== row.periodKey
                        ? 0.35
                        : 1
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}