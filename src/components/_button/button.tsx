"use client";

import styles from "@/components/ui/btn.module.css";

interface ButtonProps {
  text?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}

export default function Button({ text, icon, onClick, variant = "primary" }: ButtonProps) {
  return (
    <button className={`${styles.btn} ${styles[variant]}`} onClick={onClick}>
      {icon && <span className={styles.icon}>{icon}</span>}
      {text && <span>{text}</span>}
    </button>
  );
}