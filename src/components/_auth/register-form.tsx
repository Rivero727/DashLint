"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
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

export default function RegisterForm() {
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
    title = "No se pudo crear la cuenta",
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
      title: "Cuenta creada con éxito",
      message:
        "Tu cuenta fue creada correctamente. Serás redirigido al inicio de sesión en 2 segundos.",
    });

    redirectTimeoutRef.current = setTimeout(() => {
      router.push("/login");
    }, 2000);
  }

  function getFriendlyRegisterError(error: AuthClientErrorLike): {
    title: string;
    message: string;
  } {
    const code = (error.code || "").toLowerCase();
    const message = (error.message || "").toLowerCase();
    const status = error.status;

    // Validaciones del request / body
    if (
      code === "validation_error" ||
      message.includes("invalid input") ||
      message.includes("validation")
    ) {
      return {
        title: "Datos inválidos",
        message:
          "Revisa la información capturada. Asegúrate de escribir un nombre, un correo válido y una contraseña de al menos 8 caracteres.",
      };
    }

    // Correo ya registrado / conflicto de unicidad
    if (
      code === "user_already_exists" ||
      code === "email_already_exists" ||
      message.includes("already exists") ||
      message.includes("email already exists") ||
      message.includes("user already exists") ||
      message.includes("unique constraint") ||
      message.includes("email conflicts")
    ) {
      return {
        title: "Correo ya registrado",
        message:
          "Ya existe una cuenta con este correo electrónico. Intenta iniciar sesión o usa otro correo.",
      };
    }

    // Registro deshabilitado
    if (
      code === "signup_disabled" ||
      message.includes("sign up is disabled") ||
      message.includes("signup disabled")
    ) {
      return {
        title: "Registro no disponible",
        message:
          "En este momento no es posible crear nuevas cuentas. Intenta nuevamente más tarde.",
      };
    }

    // Password demasiado corto o inválido
    if (
      message.includes("password") &&
      (message.includes("at least") ||
        message.includes("too short") ||
        message.includes("invalid"))
    ) {
      return {
        title: "Contraseña no válida",
        message:
          "La contraseña no cumple con los requisitos mínimos. Usa al menos 8 caracteres.",
      };
    }

    // Problemas de esquema / creación de usuario / base de datos
    if (
      code === "unable_to_create_user" ||
      message.includes("unable to create user") ||
      message.includes("database") ||
      message.includes("schema") ||
      message.includes("constraint") ||
      status === 500
    ) {
      return {
        title: "No fue posible crear la cuenta",
        message:
          "Ocurrió un problema interno al guardar tu cuenta. Intenta nuevamente en unos momentos.",
      };
    }

    // Demasiadas solicitudes / rate limit
    if (
      status === 429 ||
      code === "too_many_requests" ||
      message.includes("too many requests") ||
      message.includes("rate limit")
    ) {
      return {
        title: "Demasiados intentos",
        message:
          "Has realizado demasiados intentos en poco tiempo. Espera un momento e inténtalo de nuevo.",
      };
    }

    // Problemas de red / timeout / fetch
    if (
      message.includes("fetch") ||
      message.includes("network") ||
      message.includes("timeout")
    ) {
      return {
        title: "Problema de conexión",
        message:
          "No se pudo completar el registro por un problema de conexión. Verifica tu internet e inténtalo otra vez.",
      };
    }

    // Fallback final
    return {
      title: "No se pudo crear la cuenta",
      message:
        "Ocurrió un problema inesperado al intentar crear tu cuenta. Intenta nuevamente.",
    };
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isSubmitting) return;

    clearTimers();
    setModal(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!name || !email || !password) {
      showErrorModal(
        "Todos los campos son obligatorios.",
        "Campos incompletos",
      );
      setIsSubmitting(false);
      return;
    }

    if (password.length < 8) {
      showErrorModal(
        "La contraseña debe tener al menos 8 caracteres.",
        "Contraseña inválida",
      );
      setIsSubmitting(false);
      return;
    }

    const res = await signUp.email({
      name,
      email,
      password,
    });

    if (res.error) {
      const friendly = getFriendlyRegisterError(res.error);

      console.error("Error en registro", {
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

              <p className={styles.fieldDescription}>Mínimo 8 caracteres.</p>
            </div>

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

      {modal && (
        <div className={styles.modalOverlay}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="register-modal-title"
          >
            {modal.type === "error" ? (
              <ExclamationTriangleIcon className={styles.modalIconError} />
            ) : (
              <CheckCircleIcon className={styles.modalIconSuccess} />
            )}

            <h3 id="register-modal-title" className={styles.modalTitle}>
              {modal.title}
            </h3>

            <p className={styles.modalText}>{modal.message}</p>

            {modal.type === "success" && (
              <p className={styles.modalHint}>Redirigiendo al login...</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
