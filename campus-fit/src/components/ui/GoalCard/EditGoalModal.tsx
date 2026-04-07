import { type FC, type FormEvent } from "react";
import { X } from "lucide-react";
import styles from "./EditGoalModal.module.scss";
import Button from "../../../components/ui/Button/Button";

interface EditGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: {
    title: string;
    description: string;
    targetValue: number;
  } | null;
}

const EditGoalModal: FC<EditGoalModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  if (!isOpen || !initialData) return null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // API logic to update the goal goes here
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <header className={styles.header}>
          <h2>Edit Goal</h2>
          <p>Update your fitness goal</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="editTitle">Goal Title</label>
            <input
              id="editTitle"
              type="text"
              defaultValue={initialData.title}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="editDescription">Description</label>
            <textarea
              id="editDescription"
              defaultValue={initialData.description}
              rows={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="editTarget">Target Value</label>
            <input
              id="editTarget"
              type="number"
              defaultValue={initialData.targetValue}
            />
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Cancel
            </button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGoalModal;
