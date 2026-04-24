"use client";

import {
  UserGroupIcon,
  HomeIcon,
  TableCellsIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import styles from "@/components/ui/nav-links.module.css";

const links = [
  { name: "Inicio", href: "/dashboard", icon: HomeIcon },
  {
    name: "Repositorios",
    href: "/dashboard/repositories",
    icon: TableCellsIcon,
  },
  {
    name: "Crear repositorio",
    href: "/dashboard/forms",
    icon: ClipboardDocumentCheckIcon,
  },
  { name: "Usuarios", href: "/dashboard/users", icon: UserGroupIcon },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;

        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(styles.link, {
              [styles.active]: pathname === link.href,
            })}
          >
            <LinkIcon className={styles.icon} />
            <p className={styles.linkText}>{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}