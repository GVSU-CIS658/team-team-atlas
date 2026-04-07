import { type FC, type FormEvent } from "react";
import { X } from "lucide-react";
import styles from "./CreateGoalModal.module.scss";
import Button from "../../../components/ui/Button/Button";

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateGoalModal: FC<CreateGoalModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Logic to handle form submission
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
          <h2>Create New Goal</h2>
          <p>Set a new fitness goal to track your progress</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="goalTitle">Goal Title</label>
            <input
              id="goalTitle"
              type="text"
              placeholder="e.g., Daily Steps"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="Describe your goal..."
              rows={3}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label htmlFor="type">Type</label>
              <select id="type" defaultValue="">
                <option value="" disabled>
                  Select type
                </option>
                <option value="cardio">Cardio</option>
                <option value="strength">Strength</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="period">Period</label>
              <select id="period" defaultValue="">
                <option value="" disabled>
                  Select period
                </option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="target">Target Value</label>
            <input id="target" type="number" placeholder="e.g., 10000" />
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Cancel
            </button>
            <Button type="submit">Create Goal</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGoalModal;
