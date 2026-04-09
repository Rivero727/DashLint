import styles from "@/components/ui/forms.module.css";

export default function Page() { 
    return (
        <div className={styles.container}>
            <header className={styles.header}></header>
            <main className={styles.main}>
                <h1 className={styles.text}>Registro de proyectos</h1>
                <p className={styles.text}>Bienvenido al formulario de registro de proyectos de DashLint</p>
            </main>
        </div>
    );
}