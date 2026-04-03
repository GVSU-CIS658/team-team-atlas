import type { ReactNode } from "react";
import styles from "./StatCard.module.scss";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  variant?: "blue" | "green" | "purple";
}

const StatCard = ({ title, value, icon, variant = "blue" }: StatCardProps) => {
  return (
    <div className={styles.statCard}>
      <div className={`${styles.iconWrapper} ${styles[variant]}`}>{icon}</div>
      <div className={styles.content}>
        <span className={styles.title}>{title}</span>
        <h3 className={styles.value}>{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;
