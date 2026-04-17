"use client";

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

        <div className={styles.formContainer}>
          <div className={styles.formInner}>
            <div className={styles.formHeader}>
              <h1 className={styles.title}>Inicia sesión</h1>
              <p className={styles.subtitle}>
                Ingresa tu correo abajo para acceder a tu panel
              </p>
            </div>

            <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
              <div className={styles.field}>
                <label htmlFor="email" className={styles.label}>Correo Electrónico</label>
                <input id="email" type="email" placeholder="admin@coresait.com" required className={styles.input} />
              </div>

              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <label htmlFor="password" className={styles.label}>Contraseña</label>
                  <a href="#" className={styles.forgotLink}>¿Olvidaste tu contraseña?</a>
                </div>
                <input id="password" type="password" required className={styles.input} />
              </div>

              <button type="submit" className={styles.btnPrimary}>Ingresar</button>

              <div className={styles.separator}>
                <div className={styles.separatorLine}></div>
                <span className={styles.separatorText}>O CONTINÚA CON</span>
                <div className={styles.separatorLine}></div>
              </div>

              <button type="button" className={styles.btnOutline}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ width: 20, height: 20 }}>
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                </svg>
                Ingresar con Google
              </button>

              <p className={styles.footerText}>
                ¿No tienes una cuenta? <a href="/register" className={styles.footerLink}>Regístrate</a>
              </p>
            </form>
          </div>
        </div>
      </div>

      <div className={styles.imageSection}>
        <img src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop" alt="Oficina" className={styles.coverImage} />
      </div>
    </div>
  );
}