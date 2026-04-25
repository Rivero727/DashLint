import Image from "next/image";
import Link from "next/link";
import RegisterForm from "@/components/_auth/register-form";
import styles from "@/components/ui/auth.module.css";

export default function Page() {
  return (
    <div className={styles.pageWrapper}>
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