"use client";

import { useEffect, useMemo, useState } from "react";
import SearchBar from "@/components/_searchbar/searchbar";
import RepoTable from "@/components/_repo-table/repotables";
import styles from "@/components/ui/dashboard.module.css";

type RepositoryRow = {
  submitId: number;
  vendor: string;
  name: string;
  clientName: string;
  companyName: string;
  createdAt: string;
};

type RepoContentProps = {
  initialRepositories: RepositoryRow[];
};

const ITEMS_PER_PAGE = 8;

export default function RepoContent({
  initialRepositories,
}: RepoContentProps) {
  const [repositories, setRepositories] =
    useState<RepositoryRow[]>(initialRepositories);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredRepositories = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return repositories;

    return repositories.filter((repo) => {
      return (
        repo.name.toLowerCase().includes(term) ||
        repo.vendor.toLowerCase().includes(term) ||
        repo.clientName.toLowerCase().includes(term) ||
        repo.companyName.toLowerCase().includes(term) ||
        String(repo.submitId).includes(term)
      );
    });
  }, [repositories, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRepositories.length / ITEMS_PER_PAGE),
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const paginatedRepositories = filteredRepositories.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const handleRepositoryDeleted = (submitId: number) => {
    setRepositories((prev) => prev.filter((repo) => repo.submitId !== submitId));
  };

  return (
    <>
      <div className={styles.titleContainer}>
        <div>
          <h1 className={styles.pageTitle}>Lista de Repositorios</h1>
          <p className={styles.subtitle}>
            Visualiza y administra tus repositorios de forma centralizada.
          </p>
        </div>

        <SearchBar
          placeholder="Buscar por repositorio, vendedor, cliente o empresa..."
          value={search}
          onChange={setSearch}
        />
      </div>

      <div className={styles.spacer}>
        <div className={styles.fullWidth}>
          <RepoTable
            repositories={paginatedRepositories}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredRepositories.length}
            startIndex={startIndex}
            onPageChange={setCurrentPage}
            onRepositoryDeleted={handleRepositoryDeleted}
          />
        </div>
      </div>
    </>
  );
}