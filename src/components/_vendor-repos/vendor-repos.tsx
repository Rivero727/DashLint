"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import styles from "@/components/ui/charts.module.css";

// Datos de prueba temporales
const data = [
  { name: "Ene", total: 1200 },
  { name: "Feb", total: 2100 },
  { name: "Mar", total: 800 },
  { name: "Abr", total: 1600 },
];

export default function VendorRepos() {
  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.title}>Repositorios creados por vendedor</h3>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#000f9f" stopOpacity={1} />
                <stop offset="100%" stopColor="#000f9f" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
            />
            <XAxis
              dataKey="name"
              axisLine={{ stroke: '#3BD430', strokeWidth: 1 }}
              tickLine={false}
              tick={{ fill: "#000000", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={{ stroke: '#3BD430', strokeWidth: 1 }}
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
              fill="url(#colorBar)"
              radius={[8, 8, 0, 0]}
              barSize={35}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
