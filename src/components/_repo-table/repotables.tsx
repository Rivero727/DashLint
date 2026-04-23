"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import styles from "@/components/ui/repo-table.module.css";
import {
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { deleteRepository } from "@/app/dashboard/repositories/actions";

interface Repository {
  submitId: number;
  vendor: string;
  name: string;
  clientName: string;
  companyName: string;
  createdAt: string;
}

type RepoTableProps = {
  repositories: Repository[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  onPageChange: (page: number) => void;
  onRepositoryDeleted: (submitId: number) => void;
};

function getVisiblePages(currentPage: number, totalPages: number) {
  const delta = 2;
  const start = Math.max(1, currentPage - delta);
  const end = Math.min(totalPages, currentPage + delta);

  const pages: number[] = [];

  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }

  return pages;
}

export default function RepoTable({
  repositories,
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  onPageChange,
  onRepositoryDeleted,
}: RepoTableProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [isPending, startTransition] = useTransition();

  const visiblePages = getVisiblePages(currentPage, totalPages);

  const openDelete = (repo: Repository) => {
    setSelectedRepo(repo);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedRepo(null);
  };

  const handleDelete = () => {
    if (!selectedRepo) return;

    startTransition(async () => {
      await deleteRepository(selectedRepo.submitId);
      onRepositoryDeleted(selectedRepo.submitId);
      closeDeleteModal();
    });
  };

  return (
    <>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.idCell}>ID</th>
              <th>Vendedor</th>
              <th>Repositorio</th>
              <th>Cliente</th>
              <th>Empresa</th>
              <th>Fecha de Creación</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {repositories.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyCell}>
                  No se encontraron repositorios para esta búsqueda.
                </td>
              </tr>
            ) : (
              repositories.map((repo, index) => (
                <tr key={repo.submitId}>
                  <td className={styles.idCell}>{repo.submitId}</td>
                  <td className={styles.vendorCell}>{repo.vendor}</td>
                  <td className={styles.nameCell}>
                    <Link
                      href={`/dashboard/repositories/${repo.submitId}`}
                      className={styles.nameLink}
                    >
                      {repo.name}
                    </Link>
                  </td>
                  <td>{repo.clientName}</td>
                  <td>{repo.companyName}</td>
                  <td className={styles.dateCell}>{repo.createdAt}</td>
                  <td>
                    <div className={styles.actionsCell}>
                      <button
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        title="Eliminar"
                        onClick={() => openDelete(repo)}
                      >
                        <TrashIcon style={{ width: 18 }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className={styles.tableFooter}>
          <div className={styles.pageInfo}>
            {totalItems === 0
              ? "Sin resultados"
              : `Mostrando ${startIndex + 1} - ${Math.min(
                  startIndex + repositories.length,
                  totalItems,
                )} de ${totalItems}`}
          </div>

          <div className={styles.pagination}>
            <button
              type="button"
              className={styles.pageBtn}
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </button>

            {visiblePages.map((page) => (
              <button
                key={page}
                type="button"
                className={`${styles.pageBtn} ${
                  page === currentPage ? styles.pageBtnActive : ""
                }`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              className={styles.pageBtn}
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && selectedRepo && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <ExclamationTriangleIcon className={styles.modalIcon} />
            <h3 className={styles.modalTitle}>¿Eliminar repositorio?</h3>
            <p className={styles.modalText}>
              Estás a punto de eliminar el repositorio{" "}
              <strong>{selectedRepo.name}</strong>. Esta acción no se puede
              deshacer.
            </p>

            <div className={styles.modalActions}>
              <button
                className={styles.btnCancel}
                onClick={closeDeleteModal}
                disabled={isPending}
              >
                Cancelar
              </button>

              <button
                className={styles.btnConfirm}
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}