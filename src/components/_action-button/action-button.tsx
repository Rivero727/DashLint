"use client";

import Button from "@/components/_button/button";
import { PlusIcon } from "@heroicons/react/24/outline";
import styles from "@/components/ui/dashboard.module.css";

type DashboardHeaderProps = {
  onCreate: () => void;
  isGenerating?: boolean;
};

export default function DashboardHeader({
  onCreate,
  isGenerating = false,
}: DashboardHeaderProps) {
  const handleCreate = () => {
    if (isGenerating) return;
    onCreate();
  };

  return (
    <div className={styles.actions}>
      <Button
        text={isGenerating ? "Generando reporte..." : "Nuevo Reporte"}
        icon={<PlusIcon style={{ width: "18px" }} />}
        onClick={handleCreate}
      />
    </div>
  );
}