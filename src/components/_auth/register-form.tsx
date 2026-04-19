"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import styles from "@/components/ui/auth.module.css";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function RegisterForm() {
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isSubmitting) return;

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!name || !email || !password) {
      setError("Todos los campos son obligatorios.");
      setIsSubmitting(false);
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      setIsSubmitting(false);
      return;
    }

    const res = await signUp.email({
      name,
      email,
      password,
    });

    if (res.error) {
      console.error("Error en registro:", res.error);
      setError(res.error.message || "Algo salió mal.");
      setIsSubmitting(false);
      return;
    }

    setSuccess("¡Cuenta creada con éxito! Redirigiendo al inicio de sesión...");

    setTimeout(() => {
      router.push("/login");
    }, 2000);
  }

  return (
    <div className={styles.formContainer}>
      <div className={styles.formInner}>
        <div className={styles.formHeader}>
          <h1 className={styles.title}>Crea tu cuenta</h1>
          <p className={styles.subtitle}>Completa los datos para empezar</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>
              Nombre Completo
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              required
              autoComplete="name"
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
              autoComplete="email"
              className={styles.input}
            />
            <p className={styles.fieldDescription}>
              Nunca compartiremos tu correo.
            </p>
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Contraseña
            </label>

            <div className={styles.passwordWrapper}>
              <input
                id="password"
                name="password"
                type={passwordVisible ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                className={styles.input}
              />

              <button
                type="button"
                className={styles.showPasswordBtn}
                onClick={() => setPasswordVisible((prev) => !prev)}
                aria-label={
                  passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                title={
                  passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {passwordVisible ? (
                  <EyeSlashIcon className={styles.showPasswordIcon} />
                ) : (
                  <EyeIcon className={styles.showPasswordIcon} />
                )}
              </button>
            </div>

            <p className={styles.fieldDescription}>Mínimo 8 caracteres.</p>
          </div>

          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}

          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creando cuenta..." : "Crear Cuenta"}
          </button>

          <div className={styles.separator}>
            <div className={styles.separatorLine}></div>
            <span className={styles.separatorText}>O CONTINÚA CON</span>
            <div className={styles.separatorLine}></div>
          </div>

          <button
            type="button"
            className={styles.btnOutline}
            disabled={isSubmitting}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              style={{ width: 20, height: 20 }}
            >
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              />
              <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              />
              <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
              />
              <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              />
            </svg>
            Registrarse con Google
          </button>

          <p className={styles.footerText}>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className={styles.footerLink}>
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
