import { useState, type FC, type FormEvent, type ChangeEvent } from "react";
import { X } from "lucide-react";
import styles from "./CreateGoalModal.module.scss";
import Button from "../../../components/ui/Button/Button";
import { api } from "../../../lib/api";
import type { CreateGoalPayload } from "../../../types";

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormState {
  title: string;
  description: string;
  unit: string;
  frequency: string;
  targetValue: string;
}

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  unit: "",
  frequency: "",
  targetValue: "",
};

const CreateGoalModal: FC<CreateGoalModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!form.unit || !form.frequency) {
      setError("Please select a type and period.");
      return;
    }

    const targetValue = Number(form.targetValue);
    if (!targetValue || targetValue <= 0) {
      setError("Target value must be a positive number.");
      return;
    }

    const payload: CreateGoalPayload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      unit: form.unit,
      frequency: form.frequency,
      targetValue,
    };

    try {
      setSubmitting(true);
      await api.post("/goals", payload);
      setForm(EMPTY_FORM);
      onSuccess();
    } catch (err: any) {
      setError(err.message ?? "Failed to create goal. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Close modal"
          disabled={submitting}
        >
          <X size={20} />
        </button>

        <header className={styles.header}>
          <h2>Create New Goal</h2>
          <p>Set a new fitness goal to track your progress</p>
        </header>

        {error && <p className={styles.errorMessage}>{error}</p>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Goal Title</label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="e.g., Daily Steps"
              value={form.title}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe your goal…"
              rows={3}
              value={form.description}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label htmlFor="unit">Type</label>
              <select
                id="unit"
                name="unit"
                value={form.unit}
                onChange={handleChange}
                required
                disabled={submitting}
              >
                <option value="" disabled>
                  Select type
                </option>
                <option value="steps">Steps</option>
                <option value="workouts">Workouts</option>
                <option value="miles">Miles</option>
                <option value="km">Kilometres</option>
                <option value="calories">Calories</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="frequency">Period</label>
              <select
                id="frequency"
                name="frequency"
                value={form.frequency}
                onChange={handleChange}
                required
                disabled={submitting}
              >
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
            <label htmlFor="targetValue">Target Value</label>
            <input
              id="targetValue"
              name="targetValue"
              type="number"
              min={1}
              placeholder="e.g., 10000"
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
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create Goal"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGoalModal;
