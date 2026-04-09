import styles from "@/components/ui/dashboard.module.css";
import SummaryChart from "@/components/_summary-chart/summary-chart";
import VendorRepos from "@/components/_vendor-repos/vendor-repos";

export default function Page() {
  return (
    <div className={styles.container}>
      <header className={styles.header}></header>
      <main className={styles.main}>
        <h1 className={styles.text}>Dashboard</h1>
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