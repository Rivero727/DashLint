"use client";

import { useMemo, useState } from "react";
import styles from "@/components/ui/dashboard.module.css";
import chartStyles from "@/components/ui/charts.module.css";
import DashboardStats from "@/components/_dashboard/dashboard-stats";
import DashboardRepoList from "@/components/_dashboard/dashboard-repo-list";
import SummaryChart from "@/components/_summary-chart/summary-chart";
import VendorRepos from "@/components/_vendor-repos/vendor-repos";
import SearchBar from "@/components/_searchbar/searchbar";
import DashboardHeader from "@/components/_action-button/action-button";
import {
  buildDashboardStats,
  submissionMatchesPeriod,
  type DashboardInterval,
  type DashboardSubmission,
  type DashboardUser,
} from "@/lib/dashboard-chart-utils";

type Props = {
  users: DashboardUser[];
  submissions: DashboardSubmission[];
};

type SelectedPeriod = {
  periodKey: string;
  label: string;
} | null;

const INTERVALS: Array<{ value: DashboardInterval; label: string }> = [
  { value: "day", label: "Días" },
  { value: "week", label: "Semanas" },
  { value: "month", label: "Meses" },
  { value: "year", label: "Años" },
];

export default function DashboardContent({ users, submissions }: Props) {
  const [search, setSearch] = useState("");
  const [interval, setInterval] = useState<DashboardInterval>("month");

  const [showAllDetails, setShowAllDetails] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<SelectedPeriod>(null);
  const [onlyCurrentMonth, setOnlyCurrentMonth] = useState(false);

  const filteredSubmissions = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return submissions;

    return submissions.filter((submission) => {
      return (
        submission.submitName.toLowerCase().includes(term) ||
        submission.vendorName.toLowerCase().includes(term) ||
        submission.clientName.toLowerCase().includes(term) ||
        submission.companyName.toLowerCase().includes(term) ||
        String(submission.submitId).includes(term)
      );
    });
  }, [search, submissions]);

  const stats = useMemo(
    () => buildDashboardStats(filteredSubmissions),
    [filteredSubmissions],
  );

  const detailSubmissions = useMemo(() => {
    let result = [...filteredSubmissions];

    if (selectedVendor) {
      result = result.filter((item) => item.vendorName === selectedVendor);
    }

    if (selectedClient) {
      result = result.filter((item) => item.clientName === selectedClient);
    }

    if (selectedPeriod) {
      result = result.filter((item) =>
        submissionMatchesPeriod(item, interval, selectedPeriod.periodKey),
      );
    }

    if (onlyCurrentMonth) {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      result = result.filter((item) => {
        const createdAt = new Date(item.createdAt);

        return (
          createdAt.getMonth() === currentMonth &&
          createdAt.getFullYear() === currentYear
        );
      });
    }

    return result;
  }, [
    filteredSubmissions,
    selectedVendor,
    selectedClient,
    selectedPeriod,
    onlyCurrentMonth,
    interval,
  ]);

  const hasActiveDetailFilters =
    showAllDetails ||
    !!selectedVendor ||
    !!selectedClient ||
    !!selectedPeriod ||
    onlyCurrentMonth;

  const detailTitle = useMemo(() => {
    if (
      showAllDetails &&
      !selectedVendor &&
      !selectedClient &&
      !selectedPeriod &&
      !onlyCurrentMonth
    ) {
      return "Todos los repositorios filtrados";
    }

    const parts: string[] = [];

    if (selectedVendor) {
      parts.push(`vendedor: ${selectedVendor}`);
    }

    if (selectedClient) {
      parts.push(`cliente: ${selectedClient}`);
    }

    if (selectedPeriod) {
      parts.push(`período: ${selectedPeriod.label}`);
    }

    if (onlyCurrentMonth) {
      parts.push("este mes");
    }

    if (parts.length === 0) {
      return "Repositorios filtrados";
    }

    return `Repositorios filtrados por ${parts.join(" · ")}`;
  }, [
    showAllDetails,
    selectedVendor,
    selectedClient,
    selectedPeriod,
    onlyCurrentMonth,
  ]);

  function clearDetailFilters() {
    setShowAllDetails(false);
    setSelectedVendor(null);
    setSelectedClient(null);
    setSelectedPeriod(null);
    setOnlyCurrentMonth(false);
  }

  function handleShowAll() {
    clearDetailFilters();
    setShowAllDetails(true);
  }

  function handleShowTopVendor() {
    if (stats.topVendor === "Sin datos") return;

    setShowAllDetails(false);
    setSelectedClient(null);
    setSelectedVendor(stats.topVendor);
  }

  function handleShowTopClient() {
    if (stats.topClient === "Sin datos") return;

    setShowAllDetails(false);
    setSelectedVendor(null);
    setSelectedClient(stats.topClient);
  }

  function handleShowThisMonth() {
    setShowAllDetails(false);
    setSelectedPeriod(null);
    setOnlyCurrentMonth((prev) => !prev);
  }

  function handleVendorSelect(vendorName: string) {
    setShowAllDetails(false);
    setSelectedClient(null);
    setSelectedVendor((prev) => (prev === vendorName ? null : vendorName));
  }

  function handlePeriodSelect(periodKey: string, label: string) {
    setShowAllDetails(false);
    setOnlyCurrentMonth(false);
    setSelectedPeriod((prev) =>
      prev?.periodKey === periodKey ? null : { periodKey, label },
    );
  }

  return (
    <>
      <div className={styles.titleContainer}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.subtitle}>
            Visualiza el rendimiento de tu equipo y actividad en los
            repositorios.
          </p>
        </div>

        <div className={styles.actions}>
          <DashboardHeader />
          <SearchBar
            placeholder="Buscar en el dashboard..."
            value={search}
            onChange={setSearch}
          />
        </div>
      </div>

      <DashboardStats
        stats={stats}
        onShowAll={handleShowAll}
        onShowTopVendor={handleShowTopVendor}
        onShowThisMonth={handleShowThisMonth}
        onShowTopClient={handleShowTopClient}
      />

      <div className={chartStyles.intervalToolbar}>
        <span className={chartStyles.intervalLabel}>Intervalo:</span>

        <div className={chartStyles.intervalGroup}>
          {INTERVALS.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`${chartStyles.intervalBtn} ${
                interval === item.value ? chartStyles.intervalBtnActive : ""
              }`}
              onClick={() => {
                setInterval(item.value);
                setSelectedPeriod(null);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.spacer}>
        <div className={styles.gridContainer}>
          <VendorRepos
            users={users}
            submissions={filteredSubmissions}
            interval={interval}
            selectedVendor={selectedVendor}
            onVendorSelect={handleVendorSelect}
          />

          <SummaryChart
            submissions={filteredSubmissions}
            interval={interval}
            selectedPeriodKey={selectedPeriod?.periodKey ?? null}
            onPeriodSelect={handlePeriodSelect}
          />
        </div>

        {hasActiveDetailFilters && (
          <DashboardRepoList
            title={detailTitle}
            submissions={detailSubmissions}
            onClear={clearDetailFilters}
          />
        )}
      </div>
    </>
  );
}