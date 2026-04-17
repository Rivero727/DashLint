import RepoForm from "@/components/_repo-form/repo-form";
import styles from "@/components/ui/dashboard.module.css";

export default function Page() {
  return (
    <div className={styles.container}>
      <header className={styles.header}></header>
      <main className={styles.main}>
        <div className={styles.titleContainer}>
          <div>
            <h1 className={styles.pageTitle}>Crear nuevo repositorio</h1>
            <p className={styles.subtitle}>
              Puedes crear un nuevo repositorio aquí.
            </p>
          </div>
        </div>
        <RepoForm />
      </main>
    </div>
  );
}
