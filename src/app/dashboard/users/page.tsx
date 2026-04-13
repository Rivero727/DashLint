import styles from "@/components/ui/dashboard.module.css";
import SummaryChart from "@/components/_summary-chart/summary-chart";
import VendorRepos from "@/components/_vendor-repos/vendor-repos";
import SearchBar from "@/components/searchbar/searchbar";

export default function Page() {
  return (
    <div className={styles.container}>
      <header className={styles.header}></header>
      <main className={styles.main}>
        
        <div className={styles.titleContainer}>
          <div>
            <h1 className={styles.pageTitle}>Usuarios</h1>
            <p className={styles.subtitle}>Consulta los usuarios registrados en el sistema.</p>
          </div>
          
          <SearchBar placeholder="Buscar en usuarios..." />
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