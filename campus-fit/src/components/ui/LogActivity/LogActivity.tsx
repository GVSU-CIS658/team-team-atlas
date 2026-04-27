import { useState, type FC, type FormEvent, type ChangeEvent } from "react";
import { Plus } from "lucide-react";
import styles from "./LogActivity.module.scss";
import type { Goal, LogActivityPayload } from "../../../types";

interface LogActivityProps {
  goals: Goal[];
  onLog: (goalId: string, payload: LogActivityPayload) => Promise<void>;
}

interface FormState {
  goalId: string;
  value: string;
  durationMinutes: string;
  caloriesBurned: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  goalId: "",
  value: "",
  durationMinutes: "",
  caloriesBurned: "",
  notes: "",
};

const LogActivity: FC<LogActivityProps> = ({ goals, onLog }) => {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!form.goalId) {
      setError("Please select a goal.");
      return;
    }

    const value = Number(form.value);
    if (!value || value <= 0) {
      setError("Please enter a valid value.");
      return;
    }

    // Only send fields that exist in the activity_logs table.
    // Duration and calories are shown in the UI for UX but not yet in the DB schema.
    const payload: LogActivityPayload = {
      value,
      notes: form.notes.trim() || undefined,
    };

    try {
      setSubmitting(true);
      await onLog(form.goalId, payload);
      setForm(EMPTY_FORM);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message ?? "Failed to log activity. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.logCard}>
      <div className={styles.header}>
        <h3>Log Activity</h3>
        <p>Record your workout to update goal progress</p>
      </div>

      {error && <p className={styles.errorMessage}>{error}</p>}
      {success && <p className={styles.successMessage}>Activity logged!</p>}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label>Activity Type</label>
          <select
            name="goalId"
            className={styles.select}
            value={form.goalId}
            onChange={handleChange}
            disabled={submitting}
          >
            <option value="">Select activity</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.title} ({goal.unit})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label>Value</label>
          <input
            name="value"
            type="number"
            min={1}
            placeholder="e.g., 5000"
            value={form.value}
            onChange={handleChange}
            disabled={submitting}
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Duration (minutes)</label>
          <input
            name="durationMinutes"
            type="number"
            min={1}
            placeholder="e.g., 30"
            value={form.durationMinutes}
            onChange={handleChange}
            disabled={submitting}
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Calories Burned</label>
          <input
            name="caloriesBurned"
            type="number"
            min={1}
            placeholder="e.g., 250"
            value={form.caloriesBurned}
            onChange={handleChange}
            disabled={submitting}
          />
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={submitting}
        >
          <Plus size={18} />
          <span>{submitting ? "Logging…" : "Log Activity"}</span>
        </button>
      </form>
    </div>
  );
};

export default LogActivity;
