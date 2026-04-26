"use client";

import { useMemo, useState, useTransition } from "react";
import styles from "@/components/ui/users-view.module.css";
import {
  PencilSquareIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { deleteUser, updateUserRole } from "@/app/dashboard/users/actions";

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
  users: UserRow[];
  roles: RoleOption[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  onPageChange: (page: number) => void;
  onUserDeleted: (userId: string) => void;
  onUserRoleUpdated: (userId: string, roleId: number, roleName: string) => void;
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

export default function UsersTable({
  users,
  roles,
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  onPageChange,
  onUserDeleted,
  onUserRoleUpdated,
}: Props) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const sortedRoles = useMemo(() => roles, [roles]);
  const visiblePages = getVisiblePages(currentPage, totalPages);

  const openDelete = (user: UserRow) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const openRole = (user: UserRow) => {
    setSelectedUser(user);
    setSelectedRoleId(user.roleId);
    setShowRoleModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const closeRoleModal = () => {
    setShowRoleModal(false);
    setSelectedUser(null);
    setSelectedRoleId(null);
  };

  const handleRoleChange = () => {
    if (!selectedUser || selectedRoleId == null) return;

    startTransition(async () => {
      await updateUserRole(selectedUser.id, selectedRoleId);

      const updatedRole = roles.find((role) => role.roleId === selectedRoleId);

      onUserRoleUpdated(
        selectedUser.id,
        selectedRoleId,
        updatedRole?.roleName ?? selectedUser.role,
      );

      closeRoleModal();
    });
  };

  const handleDelete = () => {
    if (!selectedUser) return;

    startTransition(async () => {
      await deleteUser(selectedUser.id);
      onUserDeleted(selectedUser.id);
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
              <th>Usuario</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyCell}>
                  No se encontraron usuarios para esta búsqueda.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className={styles.idCell}>{user.userNumber}</td>
                  <td>
                    <span className={styles.userName}>{user.name}</span>
                  </td>
                  <td className={styles.emailCell}>{user.email}</td>
                  <td className={styles.userName}>{user.role}</td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        user.status === "Activo"
                          ? styles.active
                          : styles.inactive
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionsCell}>
                      <button
                        className={styles.actionBtn}
                        title="Cambiar Rol"
                        onClick={() => openRole(user)}
                      >
                        <PencilSquareIcon style={{ width: 18 }} />
                      </button>

                      <button
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        title="Eliminar"
                        onClick={() => openDelete(user)}
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
              : `Mostrando usuarios ${startIndex + 1} - ${Math.min(
                  startIndex + users.length,
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

      {showRoleModal && selectedUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <UserCircleIcon className={styles.modalIconRole} />
            <h3 className={styles.modalTitle}>Cambiar Rol de Usuario</h3>
            <p className={styles.modalText}>
              Selecciona el nuevo nivel de acceso para{" "}
              <strong>{selectedUser.name}</strong>.
            </p>

            <select
              className={styles.roleSelect}
              value={selectedRoleId ?? ""}
              onChange={(e) => setSelectedRoleId(Number(e.target.value))}
            >
              <option value="" disabled>
                Selecciona un rol
              </option>

              {sortedRoles.map((role) => (
                <option key={role.roleId} value={role.roleId}>
                  {role.roleName}
                </option>
              ))}
            </select>

            <div className={styles.modalActions}>
              <button
                className={styles.btnCancel}
                onClick={closeRoleModal}
                disabled={isPending}
              >
                Cancelar
              </button>

              <button
                className={styles.btnConfirmRole}
                onClick={handleRoleChange}
                disabled={isPending || selectedRoleId == null}
              >
                {isPending ? "Guardando..." : "Guardar Cambio"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <ExclamationTriangleIcon className={styles.modalIcon} />
            <h3 className={styles.modalTitle}>¿Eliminar usuario?</h3>
            <p className={styles.modalText}>
              Estás a punto de eliminar a <strong>{selectedUser.name}</strong>.
              Esta acción no se puede deshacer.
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
