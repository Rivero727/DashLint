"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import styles from "@/components/ui/searchbar.module.css";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export default function SearchBar({
  placeholder = "Buscar...",
  className,
  value = "",
  onChange,
}: SearchBarProps) {
  return (
    <div className={`${styles.container} ${className ?? ""}`}>
      <div className={styles.iconWrapper}>
        <MagnifyingGlassIcon className={styles.icon} />
      </div>

      <input
        type="text"
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
}