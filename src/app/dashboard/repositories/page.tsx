import styles from "@/components/ui/dashboard.module.css";
import RepoContent from "@/components/_repo-table/repo-content";
import { getRepositories } from "./data";
import { getCurrentUserWithRole, isAdminRole } from "@/lib/permissions";

export default async function Page() {
  const currentUser = await getCurrentUserWithRole();

  const repositories = await getRepositories({
    userId: currentUser.id,
    isAdmin: isAdminRole(currentUser.role?.roleName),
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}></header>

      <main className={styles.main}>
        <RepoContent initialRepositories={repositories} />
      </main>
    </div>
  );
}