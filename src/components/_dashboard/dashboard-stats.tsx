"use client";

import {
  FolderIcon,
  TrophyIcon,
  CalendarDaysIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import styles from "@/components/ui/dashboard-stats.module.css";
import type { DashboardStats } from "@/lib/dashboard-chart-utils";

type Props = {
  stats: DashboardStats;
  onShowAll: () => void;
  onShowTopVendor: () => void;
  onShowThisMonth: () => void;
  onShowTopClient: () => void;
};

export default function DashboardStats({
  stats,
  onShowAll,
  onShowTopVendor,
  onShowThisMonth,
  onShowTopClient,
}: Props) {
  return (
    <div className={styles.statsGrid}>
      <button type="button" className={styles.statCard} onClick={onShowAll}>
        <div className={styles.statIconWrapper}>
          <FolderIcon className={styles.statIcon} />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statLabel}>Total de Repositorios</span>
          <span className={styles.statValue}>{stats.totalRepositories}</span>
        </div>
      </button>

      <button
        type="button"
        className={styles.statCard}
        onClick={onShowTopVendor}
        disabled={stats.topVendor === "Sin datos"}
      >
        <div className={styles.statIconWrapper}>
          <TrophyIcon className={styles.statIcon} />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statLabel}>Vendedor líder</span>
          <span className={styles.statValue}>{stats.topVendor}</span>
        </div>
      </button>

      <button
        type="button"
        className={styles.statCard}
        onClick={onShowThisMonth}
      >
        <div className={styles.statIconWrapper}>
          <CalendarDaysIcon className={styles.statIcon} />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statLabel}>Repositorios este mes</span>
          <span className={styles.statValue}>{stats.repositoriesThisMonth}</span>
        </div>
      </button>

      <button
        type="button"
        className={styles.statCard}
        onClick={onShowTopClient}
        disabled={stats.topClient === "Sin datos"}
      >
        <div className={styles.statIconWrapper}>
          <BuildingOffice2Icon className={styles.statIcon} />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statLabel}>Cliente con más repositorios</span>
          <span className={styles.statValue}>{stats.topClient}</span>
        </div>
      </button>
    </div>
  );
}