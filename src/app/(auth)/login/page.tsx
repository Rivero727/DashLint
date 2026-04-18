import LoginForm from "@/components/_auth/login-form";
import styles from "@/components/ui/auth.module.css";
import { ComputerDesktopIcon } from "@heroicons/react/24/outline";

export default function Page() {
  return (
    <div className={`${styles.pageWrapper} ${styles.reverseLayout}`}>
      <div className={styles.formSection}>
        <div className={styles.headerTop}>
          <a href="/" className={styles.logoContainer}>
            <div className={styles.logoIcon}>
              <ComputerDesktopIcon style={{ width: 16 }} />
            </div>
            CORESA IT
          </a>
        </div>
        <LoginForm />
      </div>
      <div className={styles.imageSection}>
        <img
          src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop"
          alt="Oficina"
          className={styles.coverImage}
        />
      </div>
    </div>
  );
}
