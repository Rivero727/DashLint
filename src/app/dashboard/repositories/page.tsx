import styles from "@/components/ui/dashboard.module.css";
import SearchBar from "@/components/_searchbar/searchbar";
import RepoTable from "@/components/_repo-table/repotables";

export default function Page() {
  return (
    <div className={styles.container}>
      <header className={styles.header}></header>
      <main className={styles.main}>
        <div className={styles.titleContainer}>
          <div>
            <h1 className={styles.pageTitle}>Lista de Repositorios</h1>
            <p className={styles.subtitle}>
              Visualiza y administra tus repositorios de forma centralizada.
            </p>
          </div>
          <SearchBar placeholder="Buscar repositorio..." />
        </div>
        <div className={styles.spacer}>
          <div className={styles.fullWidth}>
            <RepoTable />
          </div>
        </div>
      </main>
    </div>
  );
}
