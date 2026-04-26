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
import { ROLE_ADMIN } from "@/lib/roles";

type NavLinksProps = {
  roleName: string | null;
};

const links = [
  { name: "Inicio", href: "/dashboard", icon: HomeIcon, adminOnly: false },
  {
    name: "Repositorios",
    href: "/dashboard/repositories",
    icon: TableCellsIcon,
    adminOnly: false,
  },
  {
    name: "Crear repositorio",
    href: "/dashboard/forms",
    icon: ClipboardDocumentCheckIcon,
    adminOnly: false,
  },
  {
    name: "Usuarios",
    href: "/dashboard/users",
    icon: UserGroupIcon,
    adminOnly: true,
  },
];

export default function NavLinks({ roleName }: NavLinksProps) {
  const pathname = usePathname();

  const visibleLinks = links.filter((link) => {
    if (!link.adminOnly) return true;

    return roleName === ROLE_ADMIN;
  });

  return (
    <>
      {visibleLinks.map((link) => {
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