import { headers } from "next/headers";
import { redirect } from "next/navigation";
import styles from "@/components/ui/dashboard.module.css";
import DashboardContent from "@/components/_dashboard/dashboard-content";
import { auth } from "@/lib/auth";
import { getDashboardData } from "./data";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const { users, submissions } = await getDashboardData();

  return (
    <div className={styles.container}>
      <header className={styles.header}></header>

      <main className={styles.main}>
        <DashboardContent
          users={users}
          submissions={submissions}
          currentUserName={session.user.name ?? "Usuario no identificado"}
          currentUserEmail={session.user.email ?? "correo-no-disponible"}
        />
      </main>
    </div>
  );
}