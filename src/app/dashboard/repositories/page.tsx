import styles from "@/components/ui/dashboard.module.css";
import RepoContent from "@/components/_repo-table/repo-content";
import { getRepositories } from "./data";

export default async function Page() {
  const repositories = await getRepositories();

  return (
    <div className={styles.container}>
      <header className={styles.header}></header>

      <main className={styles.main}>
        <RepoContent initialRepositories={repositories} />
      </main>
    </div>
  );
}