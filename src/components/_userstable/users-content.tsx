"use client";

import { useMemo, useState } from "react";
import SearchBar from "@/components/_searchbar/searchbar";
import UsersTable from "@/components/_userstable/userstable";
import styles from "@/components/ui/dashboard.module.css";

type UserRow = {
  id: string;
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

export default function UsersContent({ initialUsers, roles }: Props) {
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return initialUsers;

    return initialUsers.filter((user) => {
      return (
        user.name.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    });
  }, [initialUsers, search]);

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
          placeholder="Buscar por nombre, rol o correo..."
          value={search}
          onChange={setSearch}
        />
      </div>

      <div className={styles.spacer}>
        <div className={styles.fullWidth}>
          <UsersTable initialUsers={filteredUsers} roles={roles} />
        </div>
      </div>
    </>
  );
}