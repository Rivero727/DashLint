import Image from "next/image";
import Link from "next/link";
import LoginForm from "@/components/_auth/login-form";
import styles from "@/components/ui/auth.module.css";

export default function Page() {
  return (
    <div className={`${styles.pageWrapper} ${styles.reverseLayout}`}>
      <div className={styles.formSection}>
        <div className={styles.headerTop}>
          <Link href="/" className={styles.logoContainer} aria-label="Ir al inicio">
            <div className={styles.logoImageBox}>
              <Image
                src="/logocoresa.svg"
                alt="Logo CORESA IT"
                fill
                className={styles.logoImage}
                sizes="160px"
                priority
              />
            </div>
          </Link>
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