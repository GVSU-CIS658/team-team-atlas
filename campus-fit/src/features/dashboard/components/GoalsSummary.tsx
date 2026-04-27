import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import type { Goal } from "../../../types";
import styles from "./GoalsSummary.module.scss";

export default function GoalsSummary() {
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    api
      .get<{ summary: unknown; goals: Goal[] }>("/goals?status=active&limit=3")
      .then((data) => setGoals(data.goals))
      .catch(() => {});
  }, []);

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Your Goals</h3>
          <p className={styles.subtitle}>Track your personal fitness targets</p>
        </div>
        <button className={styles.addBtn}>+ Add Goal</button>
      </div>

      <div className={styles.goalList}>
        {goals.length === 0 && (
          <p className={styles.empty}>No active goals yet</p>
        )}
        {goals.map((goal) => (
          <GoalRow key={goal.id} goal={goal} />
        ))}
      </div>
    </section>
  );
}

function GoalRow({ goal }: { goal: Goal }) {
  return (
    <div className={styles.goalRow}>
      <div className={styles.goalInfo}>
        <span className={styles.goalTitle}>{goal.title}</span>
        <span className={styles.goalProgress}>
          {goal.currentValue.toLocaleString()} /{" "}
          {goal.targetValue.toLocaleString()} {goal.unit}
        </span>
      </div>
      <span className={styles.frequencyBadge}>{goal.frequency}</span>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${goal.progressPct}%` }}
        />
      </div>
    </div>
  );
}
