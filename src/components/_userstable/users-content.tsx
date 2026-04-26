"use client";

import { useEffect, useMemo, useState } from "react";
import SearchBar from "@/components/_searchbar/searchbar";
import UsersTable from "@/components/_userstable/userstable";
import styles from "@/components/ui/dashboard.module.css";

type UserRow = {
  id: string;
  userNumber: number;
  name: string;
  email: string;
  role: string;
  roleId: number | null;
  status: "Activo" | "Inactivo";
};

type RoleOption = {
  roleId: number;
  roleName: string;
};

type Props = {
  initialUsers: UserRow[];
  roles: RoleOption[];
};

const ITEMS_PER_PAGE = 8;

function sortUsersByNumber(users: UserRow[]) {
  return [...users].sort((a, b) => a.userNumber - b.userNumber);
}

export default function UsersContent({ initialUsers, roles }: Props) {
  const [users, setUsers] = useState<UserRow[]>(() =>
    sortUsersByNumber(initialUsers),
  );
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setUsers(sortUsersByNumber(initialUsers));
  }, [initialUsers]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return users;

    return users.filter((user) => {
      return (
        String(user.userNumber).includes(term) ||
        user.name.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    });
  }, [users, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / ITEMS_PER_PAGE),
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const handleUserDeleted = (userId: string) => {
    setUsers((prev) =>
      sortUsersByNumber(prev.filter((user) => user.id !== userId)),
    );
  };

  const handleUserRoleUpdated = (
    userId: string,
    roleId: number,
    roleName: string,
  ) => {
    setUsers((prev) =>
      sortUsersByNumber(
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                roleId,
                role: roleName,
              }
            : user,
        ),
      ),
    );
  };

  return (
    <>
      <div className={styles.titleContainer}>
        <div>
          <h1 className={styles.pageTitle}>Usuarios</h1>
          <p className={styles.subtitle}>
            Consulta los usuarios registrados en el sistema.
          </p>
        </div>

        <SearchBar
          placeholder="Buscar por ID, nombre, rol o correo..."
          value={search}
          onChange={setSearch}
        />
      </div>

      <div className={styles.spacer}>
        <div className={styles.fullWidth}>
          <UsersTable
            users={paginatedUsers}
            roles={roles}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredUsers.length}
            startIndex={startIndex}
            onPageChange={setCurrentPage}
            onUserDeleted={handleUserDeleted}
            onUserRoleUpdated={handleUserRoleUpdated}
          />
        </div>
      </div>
    </>
  );
}