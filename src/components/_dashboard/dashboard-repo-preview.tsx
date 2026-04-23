"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  XMarkIcon,
  FolderIcon,
  UserIcon,
  BuildingOffice2Icon,
  DocumentTextIcon,
  PaperClipIcon,
} from "@heroicons/react/24/outline";
import styles from "@/components/ui/dashboard-repo-preview.module.css";

type PreviewFile = {
  fileId: number;
  fileName: string;
  filePath: string;
  fileSize: number | null;
};

type PreviewRepository = {
  submitId: number;
  submitName: string;
  clientName: string;
  companyName: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  vendorName: string;
  vendorEmail: string;
  files: PreviewFile[];
};

type Props = {
  isOpen: boolean;
  repository: PreviewRepository | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function DashboardRepoPreview({
  isOpen,
  repository,
  isLoading,
  error,
  onClose,
}: Props) {
  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <aside
        className={styles.drawer}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="repo-preview-title"
      >
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Resumen rápido</p>
            <h3 id="repo-preview-title" className={styles.title}>
              {repository ? repository.submitName : "Cargando repositorio..."}
            </h3>
          </div>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Cerrar panel"
          >
            <XMarkIcon className={styles.closeIcon} />
          </button>
        </div>

        <div className={styles.body}>
          {isLoading ? (
            <div className={styles.stateBox}>Cargando información...</div>
          ) : error ? (
            <div className={styles.stateError}>{error}</div>
          ) : repository ? (
            <>
              <div className={styles.metaGrid}>
                <div className={styles.metaCard}>
                  <FolderIcon className={styles.metaIcon} />
                  <div>
                    <span className={styles.metaLabel}>ID</span>
                    <p className={styles.metaValue}>#{repository.submitId}</p>
                  </div>
                </div>

                <div className={styles.metaCard}>
                  <UserIcon className={styles.metaIcon} />
                  <div>
                    <span className={styles.metaLabel}>Vendedor</span>
                    <p className={styles.metaValue}>{repository.vendorName}</p>
                  </div>
                </div>

                <div className={styles.metaCard}>
                  <BuildingOffice2Icon className={styles.metaIcon} />
                  <div>
                    <span className={styles.metaLabel}>Cliente</span>
                    <p className={styles.metaValue}>{repository.clientName}</p>
                  </div>
                </div>

                <div className={styles.metaCard}>
                  <BuildingOffice2Icon className={styles.metaIcon} />
                  <div>
                    <span className={styles.metaLabel}>Empresa</span>
                    <p className={styles.metaValue}>{repository.companyName}</p>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>Fechas</h4>
                <div className={styles.detailList}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Creado</span>
                    <span className={styles.detailValue}>
                      {formatDate(repository.createdAt)}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Actualizado</span>
                    <span className={styles.detailValue}>
                      {formatDate(repository.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>Descripción</h4>
                <div className={styles.descriptionBox}>
                  <DocumentTextIcon className={styles.descriptionIcon} />
                  <p className={styles.descriptionText}>
                    {repository.description || "Este repositorio no tiene descripción."}
                  </p>
                </div>
              </div>

              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>
                  Archivos PDF ({repository.files.length})
                </h4>

                {repository.files.length === 0 ? (
                  <div className={styles.stateBox}>
                    Este repositorio no tiene archivos.
                  </div>
                ) : (
                  <div className={styles.fileList}>
                    {repository.files.map((file) => (
                      <a
                        key={file.fileId}
                        href={file.filePath}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.fileItem}
                      >
                        <PaperClipIcon className={styles.fileIcon} />
                        <div className={styles.fileContent}>
                          <span className={styles.fileName}>{file.fileName}</span>
                          <span className={styles.fileMeta}>
                            {file.fileSize
                              ? `${(file.fileSize / 1024 / 1024).toFixed(2)} MB`
                              : "Tamaño no disponible"}
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className={styles.stateBox}>
              No se pudo cargar la información del repositorio.
            </div>
          )}
        </div>

        <div className={styles.footer}>
          {repository && (
            <Link
              href={`/dashboard/repositories/${repository.submitId}`}
              className={styles.primaryBtn}
            >
              Ir al detalle completo
            </Link>
          )}

          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </aside>
    </div>
  );
}