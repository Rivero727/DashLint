import RegisterForm from "@/components/_auth/register-form";
import styles from "@/components/ui/auth.module.css";
import { ComputerDesktopIcon } from "@heroicons/react/24/outline";

export default function Page() {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.formSection}>
        <div className={styles.headerTop}>
          <a href="/" className={styles.logoContainer}>
            <div className={styles.logoIcon}>
              <ComputerDesktopIcon style={{ width: 16 }} />
            </div>
            CORESA IT
          </a>
        </div>
        <RegisterForm />
      </div>
      <div className={styles.imageSection}>
        <img
          src="https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop"
          alt="Background"
          className={styles.coverImage}
        />
      </div>
    </div>
  );
}
