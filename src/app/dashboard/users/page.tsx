import styles from "@/components/ui/dashboard.module.css";
import SearchBar from "@/components/_searchbar/searchbar";
import UsersTable from "@/components/_userstable/userstable";

export default function Page() {
  return (
    <div className={styles.container}>
      <header className={styles.header}></header>
      <main className={styles.main}>
        <div className={styles.titleContainer}>
          <div>
            <h1 className={styles.pageTitle}>Usuarios</h1>
            <p className={styles.subtitle}>
              Consulta los usuarios registrados en el sistema.
            </p>
          </div>
          <SearchBar placeholder="Buscar en usuarios..." />
        </div>

        <div className={styles.spacer}>
          <div className={styles.fullWidth}>
            <UsersTable />
          </div>
        </div>
      </main>
    </div>
  );
}
