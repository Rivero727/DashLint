import Sidenav from "@/components/_sidevardashboard/sidenav"; // Asumiendo que creas este componente
import styles from "@/components/ui/layout-dashboard.module.css";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.container}>
      {/* El Sidenav se queda fijo a la izquierda */}
      <aside className={styles.sidebar}>
        <Sidenav />
      </aside>

      {/* El contenido principal se desplaza a la derecha */}
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}