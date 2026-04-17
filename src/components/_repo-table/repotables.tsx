import styles from "@/components/ui/repo-table.module.css";

// Definimos la estructura de un repositorio
interface Repository {
  id: number;
  vendor: string;
  name: string;
  createdAt: string;
}

// Datos estáticos por ahora
const MOCK_DATA: Repository[] = [
  { id: 101, vendor: "Microsoft", name: "vscode-docs", createdAt: "2024-03-15" },
  { id: 102, vendor: "Facebook", name: "react-native", createdAt: "2024-03-10" },
  { id: 103, vendor: "Vercel", name: "next.js", createdAt: "2024-04-01" },
  { id: 104, vendor: "Tailwind", name: "tailwindcss-site", createdAt: "2024-02-20" },
];

export default function RepoTable() {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.idCell}>ID</th>
            <th>Vendedor</th>
            <th>Repositorio</th>
            <th>Fecha de Creación</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_DATA.map((repo) => (
            <tr key={repo.id}>
              <td className={styles.idCell}>#{repo.id}</td>
              <td className={styles.vendorCell}>{repo.vendor}</td>
              <td className={styles.nameCell}>{repo.name}</td>
              <td className={styles.dateCell}>{repo.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}