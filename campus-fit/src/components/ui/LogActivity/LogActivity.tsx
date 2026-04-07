import { Plus } from "lucide-react";
import styles from "./LogActivity.module.scss";

const LogActivity = () => {
  return (
    <div className={styles.logCard}>
      <div className={styles.header}>
        <h3>Log Activity</h3>
        <p>Record your workout to update goal progress</p>
      </div>

      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <div className={styles.inputGroup}>
          <label>Activity Type</label>
          <select className={styles.select}>
            <option value="">Select activity</option>
            <option value="running">Running</option>
            <option value="walking">Walking</option>
            <option value="cycling">Cycling</option>
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label>Value</label>
          <input type="text" placeholder="e.g., 5000" />
        </div>

        <div className={styles.inputGroup}>
          <label>Duration (minutes)</label>
          <input type="text" placeholder="e.g., 30" />
        </div>

        <div className={styles.inputGroup}>
          <label>Calories Burned</label>
          <input type="text" placeholder="e.g., 250" />
        </div>

        <button type="submit" className={styles.submitBtn}>
          <Plus size={18} />
          <span>Log Activity</span>
        </button>
      </form>
    </div>
  );
};

export default LogActivity;
