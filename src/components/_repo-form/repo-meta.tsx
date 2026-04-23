import styles from "@/components/ui/repo-form.module.css";

type RepoMetaProps = {
  submitId: number;
  createdAt: string;
  updatedAt: string;
  fileCount: number;
};

export default function RepoMeta({
  submitId,
  createdAt,
  updatedAt,
  fileCount,
}: RepoMetaProps) {
  return (
    <div className={styles.metaContainer}>
      <div className={styles.metaCard}>
        <span className={styles.metaLabel}>ID del Repositorio</span>
        <span className={styles.metaValue}>#{submitId}</span>
      </div>

      <div className={styles.metaCard}>
        <span className={styles.metaLabel}>Fecha de Creación</span>
        <span className={styles.metaValue}>{createdAt}</span>
      </div>

      <div className={styles.metaCard}>
        <span className={styles.metaLabel}>Última Actualización</span>
        <span className={styles.metaValue}>{updatedAt}</span>
      </div>

      <div className={styles.metaCard}>
        <span className={styles.metaLabel}>Archivos Adjuntos</span>
        <span className={styles.metaValue}>{fileCount}</span>
      </div>
    </div>
  );
}