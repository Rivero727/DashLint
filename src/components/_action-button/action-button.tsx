"use client";

import Button from "@/components/_button/button";
import { PlusIcon } from "@heroicons/react/24/outline";
import styles from "@/components/ui/dashboard.module.css";
export default function DashboardHeader() {
  const handleCreate = () => {
    console.log("¡Click desde el cliente!");
  };

  return (
      <div className={styles.actions}>
        <Button
          text="Nuevo Reporte"
          icon={<PlusIcon style={{ width: '18px' }} />}
          onClick={handleCreate}
        />
      </div>
  );
}