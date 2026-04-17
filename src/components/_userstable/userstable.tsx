"use client";

import { useState } from 'react';
import styles from '@/components/ui/users-view.module.css';
import { PencilSquareIcon, TrashIcon, ExclamationTriangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const MOCK_USERS = [
  { id: 1, name: "Admin Coresa", email: "admin@coresait.com", role: "Administrador", status: "Activo" },
  { id: 2, name: "Eldy Pro", email: "eldy@coresait.com", role: "Editor", status: "Activo" },
  { id: 3, name: "User Test", email: "test@coresait.com", role: "Lector", status: "Inactivo" },
];

export default function UsersTable() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<typeof MOCK_USERS[0] | null>(null);

  const openDelete = (user: typeof MOCK_USERS[0]) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const openRole = (user: typeof MOCK_USERS[0]) => {
    setSelectedUser(user);
    setShowRoleModal(true);
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
            {MOCK_USERS.map((user) => (
              <tr key={user.id}>
                <td className={styles.idCell}>#{user.id}</td>
                <td><span className={styles.userName}>{user.name}</span></td>
                <td className={styles.emailCell}>{user.email}</td>
                <td className={styles.userName}>{user.role}</td>
                <td>
                  <span className={`${styles.statusBadge} ${user.status === 'Activo' ? styles.active : styles.inactive}`}>
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
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL CAMBIAR ROL */}
      {showRoleModal && selectedUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <UserCircleIcon className={styles.modalIconRole} />
            <h3 className={styles.modalTitle}>Cambiar Rol de Usuario</h3>
            <p className={styles.modalText}>
              Selecciona el nuevo nivel de acceso para <strong>{selectedUser.name}</strong>.
            </p>
            
            <select className={styles.roleSelect} defaultValue={selectedUser.role}>
              <option value="Administrador">Administrador</option>
              <option value="Editor">Editor</option>
              <option value="Lector">Lector</option>
            </select>

            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setShowRoleModal(false)}>Cancelar</button>
              <button className={styles.btnConfirmRole} onClick={() => setShowRoleModal(false)}>Guardar Cambio</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {showDeleteModal && selectedUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <ExclamationTriangleIcon className={styles.modalIcon} />
            <h3 className={styles.modalTitle}>¿Eliminar usuario?</h3>
            <p className={styles.modalText}>
              Estás a punto de eliminar a <strong>{selectedUser.name}</strong>. Esta acción no se puede deshacer.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setShowDeleteModal(false)}>Cancelar</button>
              <button className={styles.btnConfirm} onClick={() => setShowDeleteModal(false)}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}