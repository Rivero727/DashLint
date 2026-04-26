import styles from "@/components/ui/dashboard.module.css";
import DashboardContent from "@/components/_dashboard/dashboard-content";
import { getDashboardData } from "./data";
import { getCurrentUserWithRole, isAdminRole } from "@/lib/permissions";

export default async function Page() {
  const currentUser = await getCurrentUserWithRole();

  const isAdmin = isAdminRole(currentUser.role?.roleName);

  const { users, submissions } = await getDashboardData({
    userId: currentUser.id,
    isAdmin,
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}></header>

      <main className={styles.main}>
        <DashboardContent
          users={users}
          submissions={submissions}
          currentUserName={currentUser.name ?? "Usuario no identificado"}
          currentUserEmail={currentUser.email ?? "correo-no-disponible"}
        />
      </main>
    </div>
  );
}