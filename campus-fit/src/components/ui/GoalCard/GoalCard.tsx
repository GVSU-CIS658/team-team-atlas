import { type FC } from "react";
import { Edit2, Trash2 } from "lucide-react";
import styles from "./GoalCard.module.scss";

interface GoalCardProps {
  title: string;
  tag: string;
  description: string;
  current: number;
  total: number;
  unit: string;
  progressText: string;
  remainingText: string;
  color?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

const GoalCard: FC<GoalCardProps> = ({
  title,
  tag,
  description,
  current,
  total,
  unit,
  remainingText,
  color = "#111",
  onEdit,
  onDelete,
}) => {
  const percentage = Math.round(Math.min((current / total) * 100, 100));
  const displayProgress = `${percentage}% Complete`;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h3>
            {title} <span className={styles.tag}>{tag}</span>
          </h3>
          <p className={styles.description}>{description}</p>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.iconBtn}
            onClick={onEdit}
            aria-label="Edit goal"
          >
            <Edit2 size={18} />
          </button>
          <button
            className={`${styles.iconBtn} ${styles.delete}`}
            onClick={onDelete}
            aria-label="Delete goal"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className={styles.progressInfo}>
        <span>Progress</span>
        <span>
          {current.toLocaleString()} / {total.toLocaleString()} {unit}
        </span>
      </div>

      <div className={styles.progressBarBg}>
        <div
          className={styles.progressBarFill}
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>

      <div className={styles.footer}>
        <span className={styles.percentageText}>{displayProgress}</span>
        <span className={styles.remainingText}>{remainingText}</span>
      </div>
    </div>
  );
};

export default GoalCard;
