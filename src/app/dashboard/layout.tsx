import Sidenav from "@/components/_sidevar-dashboard/sidenav";
import styles from "@/components/ui/layout-dashboard.module.css";
import { getCurrentUserWithRole } from "@/lib/permissions";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUserWithRole();

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <Sidenav
          roleName={currentUser.role?.roleName ?? null}
          currentUserName={currentUser.name ?? "Usuario sin nombre"}
          currentUserEmail={currentUser.email ?? "correo-no-disponible"}
        />
      </aside>

      <div className={styles.content}>{children}</div>
    </div>
  );
}