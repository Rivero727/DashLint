import Image from "next/image";
import Link from "next/link";
import styles from "@/components/ui/home.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.backgroundGlowTop}></div>
      <div className={styles.backgroundGlowBottom}></div>

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLogoSlot}>
            <div className={styles.headerLogoBox}>
              <Image
                src="/logocoresa.svg"
                alt="Logo Coresa IT"
                fill
                className={styles.headerLogo}
                sizes="(min-width: 1024px) 220px, 150px"
                priority
              />
            </div>
          </div>

          <div className={styles.headerLogoSlotCenter}>
            <div className={styles.headerLogoBox}>
              <Image
                src="/dashlint-logo.png"
                alt="Logo DashLint"
                fill
                className={styles.headerLogo}
                sizes="(min-width: 1024px) 220px, 150px"
                priority
              />
            </div>
          </div>

          <div className={styles.headerLogoSlot}>
            <div className={styles.headerLogoBox}>
              <Image
                src="/CORESAIT-Eslogan.png"
                alt="Eslogan Coresa IT"
                fill
                className={styles.headerLogo}
                sizes="(min-width: 1024px) 220px, 150px"
                priority
              />
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.heroCard}>
          <div className={styles.badge}>Bienvenido</div>

          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <h1 className={styles.title}>DashLint</h1>

              <p className={styles.subtitle}>
                Plataforma centralizada para la gestión, consulta y seguimiento
                de repositorios, usuarios y métricas operativas.
              </p>

              <p className={styles.description}>
                Accede a un entorno visual y ordenado para administrar la
                información del sistema con una experiencia más clara, moderna y
                eficiente.
              </p>

              <div className={styles.actions}>
                <Link href="/login" className={styles.primaryButton}>
                  Entrar al sistema
                </Link>
              </div>
            </div>

            <div className={styles.heroVisual}>
              <div className={styles.mainLogoCard}>
                <div className={styles.mainLogoWrapper}>
                  <Image
                    src="/dashlint-logo.png"
                    alt="Logo principal DashLint"
                    fill
                    className={styles.mainLogo}
                    sizes="(min-width: 1024px) 220px, 170px"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.infoLogoWrapper}>
              <Image
                src="/logocoresa.svg"
                alt="Coresa IT"
                fill
                className={styles.infoLogo}
                sizes="48px"
              />
            </div>
            <h2 className={styles.infoTitle}>Coresa IT</h2>
            <p className={styles.infoText}>
              Respaldo corporativo y base institucional de la plataforma.
            </p>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoLogoWrapper}>
              <Image
                src="/dashlint-logo.png"
                alt="DashLint"
                fill
                className={styles.infoLogo}
                sizes="48px"
              />
            </div>
            <h2 className={styles.infoTitle}>DashLint</h2>
            <p className={styles.infoText}>
              Entorno principal para administración, consulta y análisis visual.
            </p>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoLogoWrapper}>
              <Image
                src="/futuro.png"
                alt="Identidad complementaria"
                fill
                className={styles.infoLogo}
                sizes="48px"
              />
            </div>
            <h2 className={styles.infoTitle}>Identidad visual</h2>
            <p className={styles.infoText}>
              Integración gráfica para una presentación más sólida y profesional.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}