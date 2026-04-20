"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import styles from "@/components/ui/auth.module.css";
import {
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

type ModalState =
  | {
      type: "error" | "success";
      title: string;
      message: string;
    }
  | null;

type AuthClientErrorLike = {
  code?: string;
  message?: string;
  status?: number;
  statusText?: string;
};

export default function LoginForm() {
  const router = useRouter();

  const [modal, setModal] = useState<ModalState>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modalTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
      if (modalTimeoutRef.current) clearTimeout(modalTimeoutRef.current);
    };
  }, []);

  function clearTimers() {
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }

    if (modalTimeoutRef.current) {
      clearTimeout(modalTimeoutRef.current);
      modalTimeoutRef.current = null;
    }
  }

  function showErrorModal(
    message: string,
    title = "No se pudo iniciar sesión",
  ) {
    clearTimers();

    setModal({
      type: "error",
      title,
      message,
    });

    modalTimeoutRef.current = setTimeout(() => {
      setModal(null);
    }, 3000);
  }

  function showSuccessModalAndRedirect() {
    clearTimers();

    setModal({
      type: "success",
      title: "Inicio de sesión exitoso",
      message:
        "Tus credenciales fueron verificadas correctamente. Serás redirigido al dashboard en 2 segundos.",
    });

    redirectTimeoutRef.current = setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
  }

  function getFriendlyLoginError(error: AuthClientErrorLike): {
    title: string;
    message: string;
  } {
    const code = (error.code || "").toLowerCase();
    const message = (error.message || "").toLowerCase();
    const status = error.status;

    if (
      code === "validation_error" ||
      message.includes("invalid input") ||
      message.includes("validation")
    ) {
      return {
        title: "Datos inválidos",
        message:
          "Verifica que hayas escrito correctamente tu correo y contraseña.",
      };
    }

    if (
      code === "invalid_credentials" ||
      code === "invalid_email_or_password" ||
      code === "invalid_password" ||
      message.includes("invalid credentials") ||
      message.includes("invalid email or password") ||
      message.includes("wrong password") ||
      message.includes("incorrect password") ||
      message.includes("credential")
    ) {
      return {
        title: "Credenciales incorrectas",
        message:
          "El correo o la contraseña no son correctos. Revisa tus datos e inténtalo nuevamente.",
      };
    }

    if (
      code === "user_not_found" ||
      message.includes("user not found") ||
      message.includes("account not found") ||
      message.includes("email not found")
    ) {
      return {
        title: "Cuenta no encontrada",
        message:
          "No encontramos una cuenta asociada a este correo. Verifica el correo o regístrate primero.",
      };
    }

    if (
      code === "email_not_verified" ||
      message.includes("email not verified") ||
      message.includes("verify your email")
    ) {
      return {
        title: "Correo no verificado",
        message:
          "Tu cuenta aún no ha sido verificada. Revisa tu correo electrónico antes de iniciar sesión.",
      };
    }

    if (
      code === "too_many_requests" ||
      status === 429 ||
      message.includes("too many requests") ||
      message.includes("rate limit")
    ) {
      return {
        title: "Demasiados intentos",
        message:
          "Has realizado demasiados intentos en poco tiempo. Espera un momento e inténtalo de nuevo.",
      };
    }

    if (
      status === 500 ||
      message.includes("database") ||
      message.includes("internal") ||
      message.includes("server error")
    ) {
      return {
        title: "Error interno",
        message:
          "Ocurrió un problema interno al intentar iniciar sesión. Intenta nuevamente en unos momentos.",
      };
    }

    if (
      message.includes("fetch") ||
      message.includes("network") ||
      message.includes("timeout")
    ) {
      return {
        title: "Problema de conexión",
        message:
          "No se pudo completar el inicio de sesión por un problema de conexión. Verifica tu internet e inténtalo otra vez.",
      };
    }

    return {
      title: "No se pudo iniciar sesión",
      message:
        "Ocurrió un problema inesperado al intentar iniciar sesión. Intenta nuevamente.",
    };
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isSubmitting) return;

    clearTimers();
    setModal(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      showErrorModal(
        "Debes completar tu correo electrónico y contraseña.",
        "Campos incompletos",
      );
      setIsSubmitting(false);
      return;
    }

    const res = await signIn.email({
      email,
      password,
      rememberMe: true,
    });

    if (res.error) {
      const friendly = getFriendlyLoginError(res.error);

      console.error("Error de inicio de sesión", {
        code: res.error.code,
        message: res.error.message,
        status: res.error.status,
        statusText: res.error.statusText,
      });

      showErrorModal(friendly.message, friendly.title);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    showSuccessModalAndRedirect();
  }

  return (
    <>
      <div className={styles.formContainer}>
        <div className={styles.formInner}>
          <div className={styles.formHeader}>
            <h1 className={styles.title}>Inicia sesión</h1>
            <p className={styles.subtitle}>
              Ingresa tu correo abajo para acceder a tu panel
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="admin@coresait.com"
                required
                autoComplete="email"
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label htmlFor="password" className={styles.label}>
                  Contraseña
                </label>
                <Link href="#" className={styles.forgotLink}>
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <div className={styles.passwordWrapper}>
                <input
                  id="password"
                  name="password"
                  type={passwordVisible ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  className={styles.input}
                />
                <button
                  type="button"
                  className={styles.showPasswordBtn}
                  onClick={() => setPasswordVisible((prev) => !prev)}
                  aria-label={
                    passwordVisible
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                  title={
                    passwordVisible
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >
                  {passwordVisible ? (
                    <EyeSlashIcon className={styles.showPasswordIcon} />
                  ) : (
                    <EyeIcon className={styles.showPasswordIcon} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Ingresando..." : "Ingresar"}
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
              Ingresar con Google
            </button>

            <p className={styles.footerText}>
              ¿No tienes una cuenta?{" "}
              <Link href="/register" className={styles.footerLink}>
                Regístrate
              </Link>
            </p>
          </form>
        </div>
      </div>

      {modal && (
        <div className={styles.modalOverlay}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-modal-title"
          >
            {modal.type === "error" ? (
              <ExclamationTriangleIcon className={styles.modalIconError} />
            ) : (
              <CheckCircleIcon className={styles.modalIconSuccess} />
            )}

            <h3 id="login-modal-title" className={styles.modalTitle}>
              {modal.title}
            </h3>

            <p className={styles.modalText}>{modal.message}</p>

            {modal.type === "success" && (
              <p className={styles.modalHint}>
                Redirigiendo al dashboard...
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}