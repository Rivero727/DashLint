"use client";

import { useState } from "react";
import styles from "@/components/ui/dashboard-repo-list.module.css";
import DashboardRepoPreview from "@/components/_dashboard/dashboard-repo-preview";
import type { DashboardSubmission } from "@/lib/dashboard-chart-utils";

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
  title: string;
  submissions: DashboardSubmission[];
  onClear: () => void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export default function DashboardRepoList({
  title,
  submissions,
  onClear,
}: Props) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewRepository, setPreviewRepository] =
    useState<PreviewRepository | null>(null);

  async function openPreview(submitId: number) {
    setIsPreviewOpen(true);
    setIsLoadingPreview(true);
    setPreviewError(null);
    setPreviewRepository(null);

    try {
      const response = await fetch(`/api/submissions/${submitId}/summary`);

      const data = (await response.json()) as {
        message?: string;
        repository?: PreviewRepository;
      };

      if (!response.ok || !data.repository) {
        setPreviewError(
          data.message || "No fue posible cargar el resumen del repositorio.",
        );
        setIsLoadingPreview(false);
        return;
      }

      setPreviewRepository(data.repository);
    } catch {
      setPreviewError(
        "Ocurrió un problema al cargar el resumen del repositorio.",
      );
    } finally {
      setIsLoadingPreview(false);
    }
  }

  function closePreview() {
    setIsPreviewOpen(false);
    setIsLoadingPreview(false);
    setPreviewError(null);
    setPreviewRepository(null);
  }

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.subtitle}>
              {submissions.length} repositorio{submissions.length === 1 ? "" : "s"} encontrado
              {submissions.length === 1 ? "" : "s"}.
            </p>
          </div>

          <button type="button" className={styles.clearBtn} onClick={onClear}>
            Limpiar filtros
          </button>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Repositorio</th>
                <th>Vendedor</th>
                <th>Cliente</th>
                <th>Empresa</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyCell}>
                    No hay repositorios para este filtro.
                  </td>
                </tr>
              ) : (
                submissions.map((submission) => (
                  <tr
                    key={submission.submitId}
                    className={styles.clickableRow}
                    onClick={() => openPreview(submission.submitId)}
                  >
                    <td className={styles.idCell}>#{submission.submitId}</td>
                    <td>
                      <button
                        type="button"
                        className={styles.repoButton}
                        onClick={(event) => {
                          event.stopPropagation();
                          openPreview(submission.submitId);
                        }}
                      >
                        {submission.submitName}
                      </button>
                    </td>
                    <td>{submission.vendorName}</td>
                    <td>{submission.clientName}</td>
                    <td>{submission.companyName}</td>
                    <td>{formatDate(submission.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DashboardRepoPreview
        isOpen={isPreviewOpen}
        repository={previewRepository}
        isLoading={isLoadingPreview}
        error={previewError}
        onClose={closePreview}
      />
    </>
  );
}