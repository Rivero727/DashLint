import styles from "@/components/ui/dashboard.module.css";
import UsersContent from "@/components/_userstable/users-content";
import { getUsersAndRoles } from "./data";
import { requireAdminUser } from "@/lib/permissions";

export default async function Page() {
  await requireAdminUser();

  const { users, roles } = await getUsersAndRoles();

  return (
    <div className={styles.container}>
      <header className={styles.header}></header>

      <main className={styles.main}>
        <UsersContent initialUsers={users} roles={roles} />
      </main>
    </div>
  );
}