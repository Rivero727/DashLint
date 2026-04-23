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
import { generateDashboardPdfReport } from "@/lib/generate-dashboard-report";
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
  currentUserName: string;
  currentUserEmail: string;
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

function sanitizeFileName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w.\-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export default function DashboardContent({
  users,
  submissions,
  currentUserName,
  currentUserEmail,
}: Props) {
  const [search, setSearch] = useState("");
  const [interval, setInterval] = useState<DashboardInterval>("month");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportWithCover, setReportWithCover] = useState(true);

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

  const activeReportFilters = useMemo(() => {
    const items: string[] = [];

    if (search.trim()) {
      items.push(`Búsqueda: ${search.trim()}`);
    }

    items.push(
      `Intervalo: ${
        INTERVALS.find((item) => item.value === interval)?.label ?? interval
      }`,
    );

    if (selectedVendor) {
      items.push(`Vendedor: ${selectedVendor}`);
    }

    if (selectedClient) {
      items.push(`Cliente: ${selectedClient}`);
    }

    if (selectedPeriod) {
      items.push(`Período: ${selectedPeriod.label}`);
    }

    if (onlyCurrentMonth) {
      items.push("Filtro: Este mes");
    }

    if (showAllDetails) {
      items.push("Vista detalle: Todos los repositorios");
    }

    return items;
  }, [
    search,
    interval,
    selectedVendor,
    selectedClient,
    selectedPeriod,
    onlyCurrentMonth,
    showAllDetails,
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

  function openReportModal() {
    if (isGeneratingReport) return;
    setShowReportModal(true);
  }

  function closeReportModal() {
    if (isGeneratingReport) return;
    setShowReportModal(false);
  }

  async function handleCreateReport() {
    if (isGeneratingReport) return;

    try {
      setIsGeneratingReport(true);

      const now = new Date();
      const datePart = new Intl.DateTimeFormat("sv-SE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(now);

      const intervalLabel =
        INTERVALS.find((item) => item.value === interval)?.label.toLowerCase() ??
        interval;

      const fileNameParts = ["reporte_dashboard", intervalLabel];

      if (selectedVendor) {
        fileNameParts.push(`vendor_${selectedVendor}`);
      }

      if (selectedClient) {
        fileNameParts.push(`cliente_${selectedClient}`);
      }

      if (selectedPeriod?.label) {
        fileNameParts.push(`periodo_${selectedPeriod.label}`);
      }

      if (onlyCurrentMonth) {
        fileNameParts.push("este_mes");
      }

      fileNameParts.push(reportWithCover ? "con_portada" : "sin_portada");
      fileNameParts.push(datePart);

      const fileName = sanitizeFileName(`${fileNameParts.join("_")}.pdf`);

      const reportSubmissions = hasActiveDetailFilters
        ? detailSubmissions
        : filteredSubmissions;

      const reportTitle = hasActiveDetailFilters
        ? detailTitle
        : "Resumen general del dashboard";

      await generateDashboardPdfReport({
        fileName,
        title: reportTitle,
        interval,
        activeFilters: activeReportFilters,
        submissions: reportSubmissions,
        generatedAt: now,
        generatedByName: currentUserName,
        generatedByEmail: currentUserEmail,
        showCoverPage: reportWithCover,
      });

      setShowReportModal(false);
    } catch (error) {
      console.error("No fue posible generar el reporte del dashboard:", error);
      alert("No fue posible generar el reporte PDF del dashboard.");
    } finally {
      setIsGeneratingReport(false);
    }
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
          <DashboardHeader
            onCreate={openReportModal}
            isGenerating={isGeneratingReport}
          />
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

      {showReportModal && (
        <div className={styles.reportModalOverlay}>
          <div className={styles.reportModal}>
            <h3 className={styles.reportModalTitle}>Generar reporte PDF</h3>
            <p className={styles.reportModalText}>
              Selecciona si deseas incluir una portada ejecutiva en el reporte.
              El contenido se generará usando los filtros activos del dashboard.
            </p>

            <div className={styles.reportOptions}>
              <button
                type="button"
                className={`${styles.reportOptionCard} ${
                  reportWithCover ? styles.reportOptionCardActive : ""
                }`}
                onClick={() => setReportWithCover(true)}
              >
                <span className={styles.reportOptionTitle}>Con portada</span>
                <span className={styles.reportOptionDescription}>
                  Incluye una portada ejecutiva con información del reporte,
                  filtros activos y datos del usuario que lo genera.
                </span>
              </button>

              <button
                type="button"
                className={`${styles.reportOptionCard} ${
                  !reportWithCover ? styles.reportOptionCardActive : ""
                }`}
                onClick={() => setReportWithCover(false)}
              >
                <span className={styles.reportOptionTitle}>Sin portada</span>
                <span className={styles.reportOptionDescription}>
                  Genera directamente el contenido ejecutivo del reporte sin una
                  hoja inicial.
                </span>
              </button>
            </div>

            <div className={styles.reportModalActions}>
              <button
                type="button"
                className={styles.reportModalCancel}
                onClick={closeReportModal}
                disabled={isGeneratingReport}
              >
                Cancelar
              </button>

              <button
                type="button"
                className={styles.reportModalConfirm}
                onClick={handleCreateReport}
                disabled={isGeneratingReport}
              >
                {isGeneratingReport ? "Generando..." : "Generar PDF"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}