import styles from "@/components/ui/users.module.css";

export default function Page() {
    return (
        <div className={styles.container}>
            <header className={styles.header}></header>
            <main className={styles.main}>
                <h1 className={styles.text}>Usuarios</h1>
                <p className={styles.text}>Bienvenido a la tabla de usuarios de DashLint</p>
            </main>
        </div>
    );
}