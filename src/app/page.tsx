// app/page.tsx
import Image from "next/image";
import Link from "next/link";
import styles from "@/components/ui/home.module.css";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center">
      {/* Header de color */}
      <header className={styles.header}></header>
      {/* Contenido principal */}
      <main className="flex flex-1 flex-col items-center justify-center p-8 gap-6">
        {/* Imagen centrada */}
        <Image
          src="/next.svg"
          alt="Logo"
          width={500}
          height={500}
          priority
          className="rounded-lg shadow-lg"
        />
        {/* Botón para ir al login */}
        <Link
          href="/login"
          className="mt-4 inline-block rounded-md bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
        >
          Iniciar
        </Link>
      </main>
    </div>
  );
}
