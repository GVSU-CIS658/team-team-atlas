import {
  useState,
  useEffect,
  type FC,
  type FormEvent,
  type ChangeEvent,
} from "react";
import { X } from "lucide-react";
import styles from "./EditGoalModal.module.scss";
import Button from "../../../components/ui/Button/Button";
import { api } from "../../../lib/api";
import type { Goal, UpdateGoalPayload } from "../../../types";

interface EditGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // replaces old onClose-only pattern
  goal: Goal | null; // replaces old initialData shape
}

interface FormState {
  title: string;
  description: string;
  targetValue: string;
}

const EditGoalModal: FC<EditGoalModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  goal,
}) => {
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    targetValue: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync form whenever the goal prop changes (new goal selected for editing)
  useEffect(() => {
    if (goal) {
      setForm({
        title: goal.title,
        description: goal.description ?? "",
        targetValue: goal.targetValue.toString(),
      });
      setError(null);
    }
  }, [goal]);

  if (!isOpen || !goal) return null;

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const targetValue = Number(form.targetValue);
    if (!targetValue || targetValue <= 0) {
      setError("Target value must be a positive number.");
      return;
    }

    const payload: UpdateGoalPayload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      targetValue,
    };

    try {
      setSubmitting(true);
      await api.patch(`/goals/${goal.id}`, payload);
      onSuccess();
    } catch (err: any) {
      setError(err.message ?? "Failed to save changes. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
          disabled={submitting}
        >
          <X size={20} />
        </button>

        <header className={styles.header}>
          <h2>Edit Goal</h2>
          <p>Update your fitness goal</p>
        </header>

        {error && <p className={styles.errorMessage}>{error}</p>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="editTitle">Goal Title</label>
            <input
              id="editTitle"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="editDescription">Description</label>
            <textarea
              id="editDescription"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              disabled={submitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="editTarget">Target Value</label>
            <input
              id="editTarget"
              name="targetValue"
              type="number"
              min={1}
              value={form.targetValue}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGoalModal;
