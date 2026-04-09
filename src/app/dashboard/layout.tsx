import Sidenav from "@/components/_sidevar-dashboard/sidenav"; 
import styles from "@/components/ui/layout-dashboard.module.css";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.container}>

      <aside className={styles.sidebar}>
        <Sidenav />
      </aside>

      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}