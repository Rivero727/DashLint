import styles from "@/components/ui/login.module.css";

export default function Page() {
    return (
        <div className="flex min-h-screen flex-col items-center">
            <header className={styles.header}></header>
            <main className={styles.main}>
                <h1 className={styles.text}>Dashboard</h1>
                <p className={styles.text}>Bienvenido al dashboard de CRM Lite</p>
            </main>
        </div>
    );
}