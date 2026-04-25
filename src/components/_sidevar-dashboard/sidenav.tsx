"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import NavLinks from "@/components/_nav-links/nav-links";
import Styles from "@/components/ui/sidenav.module.css";
import {
  PowerIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { signOut } from "@/lib/auth-client";

export default function SideNav() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  function openSignOutModal() {
    if (isSigningOut) return;
    setShowSignOutModal(true);
  }

  function closeSignOutModal() {
    if (isSigningOut) return;
    setShowSignOutModal(false);
  }

  async function handleSignOut() {
    if (isSigningOut) return;

    try {
      setIsSigningOut(true);

      await signOut();

      setShowSignOutModal(false);
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("No fue posible cerrar sesión:", error);
      alert("No fue posible cerrar sesión.");
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <>
      <div className={Styles.container}>
        <Link
          className={Styles.logoLink}
          href="/dashboard"
          aria-label="Ir al inicio"
        >
          <div className={Styles.logoContainer}>
            <div className={Styles.logoImageWrapper}>
              <Image
                src="/logocoresa.svg"
                alt="Logo DashLint"
                fill
                sizes="(min-width: 768px) 220px, 120px"
                className={Styles.logoImage}
                priority
              />
            </div>
          </div>
        </Link>

        <div className={Styles.navContent}>
          <NavLinks />
          <div className={Styles.spacer}></div>

          <button
            type="button"
            className={Styles.signOutButton}
            onClick={openSignOutModal}
            disabled={isSigningOut}
          >
            <PowerIcon className={Styles.icon} />
            <div className={Styles.buttonText}>
              {isSigningOut ? "Cerrando..." : "Cerrar sesión"}
            </div>
          </button>
        </div>
      </div>

      {showSignOutModal && (
        <div className={Styles.modalOverlay}>
          <div className={Styles.modal}>
            <ExclamationTriangleIcon className={Styles.modalIcon} />

            <h3 className={Styles.modalTitle}>¿Cerrar sesión?</h3>

            <p className={Styles.modalText}>
              Tu sesión actual se cerrará y tendrás que volver a iniciar sesión
              para entrar nuevamente.
            </p>

            <div className={Styles.modalActions}>
              <button
                type="button"
                className={Styles.btnCancel}
                onClick={closeSignOutModal}
                disabled={isSigningOut}
              >
                Cancelar
              </button>

              <button
                type="button"
                className={Styles.btnConfirm}
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                {isSigningOut ? "Cerrando..." : "Cerrar sesión"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}