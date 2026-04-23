"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import RepoForm from "@/components/_repo-form/repo-form";
import RepoMeta from "@/components/_repo-form/repo-meta";
import styles from "@/components/ui/repo-form.module.css";

type ExistingRepoFile = {
  fileId: number;
  fileName: string;
  filePath: string;
  fileSize: number | null;
};

type RepositoryState = {
  submitName: string;
  clientName: string;
  companyName: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  existingFiles: ExistingRepoFile[];
};

type Props = {
  submitId: number;
  sellerName: string;
  sellerEmail: string;
  initialRepository: RepositoryState;
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

export default function RepositoryDetailContent({
  submitId,
  sellerName,
  sellerEmail,
  initialRepository,
}: Props) {
  const [repository, setRepository] =
    useState<RepositoryState>(initialRepository);

  return (
    <>
      <div className={styles.detailActions}>
        <Link
          href="/dashboard/repositories"
          className={styles.secondaryActionBtn}
        >
          <ArrowLeftIcon className={styles.actionBtnIcon} />
          <span>Volver a repositorios</span>
        </Link>

        <a
          href={`/api/submissions/${submitId}/download`}
          className={styles.primaryActionBtn}
        >
          <ArrowDownTrayIcon className={styles.actionBtnIcon} />
          <span>Descargar PDFs</span>
        </a>
      </div>

      <RepoMeta
        submitId={submitId}
        createdAt={formatDate(repository.createdAt)}
        updatedAt={formatDate(repository.updatedAt)}
        fileCount={repository.existingFiles.length}
      />

      <RepoForm
        mode="edit"
        submitId={submitId}
        sellerName={sellerName}
        sellerEmail={sellerEmail}
        initialData={{
          submitName: repository.submitName,
          clientName: repository.clientName,
          companyName: repository.companyName,
          description: repository.description,
          existingFiles: repository.existingFiles,
        }}
        onRepositoryUpdated={(updatedRepository) => {
          setRepository((prev) => ({
            ...prev,
            ...updatedRepository,
          }));
        }}
      />
    </>
  );
}