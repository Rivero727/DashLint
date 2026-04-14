import styles from "@/components/ui/dashboard.module.css";
import SummaryChart from "@/components/_summary-chart/summary-chart";
import VendorRepos from "@/components/_vendor-repos/vendor-repos";
import SearchBar from "@/components/_searchbar/searchbar";

export default function Page() {
  return (
    <div className={styles.container}>
      <header className={styles.header}></header>
      <main className={styles.main}>
        <div className={styles.titleContainer}>
          <div>
            <h1 className={styles.pageTitle}>Dashboard</h1>
            <p className={styles.subtitle}>
              Visualiza el rendimiento y actividad de tus repositorios.
            </p>
          </div>

          <SearchBar placeholder="Buscar en el dashboard..." />
        </div>

        <div className={styles.spacer}>
          <div className={styles.gridContainer}>
            <VendorRepos />
            <SummaryChart />
          </div>
        </div>
      </main>
    </div>
  );
}
