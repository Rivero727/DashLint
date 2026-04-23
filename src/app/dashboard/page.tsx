import styles from "@/components/ui/dashboard.module.css";
import DashboardContent from "@/components/_dashboard/dashboard-content";
import { getDashboardData } from "./data";

export default async function Page() {
  const { users, submissions } = await getDashboardData();

  return (
    <div className={styles.container}>
      <header className={styles.header}></header>

      <main className={styles.main}>
        <DashboardContent users={users} submissions={submissions} />
      </main>
    </div>
  );
}