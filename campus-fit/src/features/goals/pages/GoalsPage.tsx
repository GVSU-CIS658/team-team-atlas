import { useState, type FC } from "react";
import { Target, CheckCircle, TrendingUp, Plus } from "lucide-react";
import styles from "./Goals.module.scss";
import StatCard from "../../../components/ui/StatCard/StartCard";
import GoalCard from "../../../components/ui/GoalCard/GoalCard";
import LogActivity from "../../../components/ui/LogActivity/LogActivity";
import Button from "../../../components/ui/Button/Button";
import CreateGoalModal from "./CreateGoalModal";
import EditGoalModal from "../../../components/ui/GoalCard/EditGoalModal";
import { useGoals } from "../hooks/useGoals";
import { api } from "../../../lib/api";
import type { Goal, LogActivityPayload } from "../../../types";

const frequencyLabel: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

const unitColor: Record<string, string> = {
  steps: "#111111",
  workouts: "#155dfc",
  miles: "#9810fa",
  calories: "#e84040",
  km: "#0ea86a",
};

function goalColor(goal: Goal): string {
  return unitColor[goal.unit] ?? "#155dfc";
}

function remainingText(goal: Goal): string {
  return `${goal.remaining.toLocaleString()} ${goal.unit} to go`;
}

const GoalsPage: FC = () => {
  const { summary, goals, loading, error, refetch } = useGoals();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/goals/${id}`);
      refetch();
    } catch (err) {
      console.error("[GoalsPage] deleteGoal error:", err);
    }
  };

  const handleEditClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsEditOpen(true);
  };

  const handleEditSaved = () => {
    setIsEditOpen(false);
    setSelectedGoal(null);
    refetch();
  };

  const handleGoalCreated = () => {
    setIsCreateOpen(false);
    refetch();
  };

  const handleLogActivity = async (
    goalId: string,
    payload: LogActivityPayload,
  ) => {
    try {
      await api.post(`/goals/${goalId}/log`, payload);
      refetch();
    } catch (err) {
      console.error("[GoalsPage] logActivity error:", err);
    }
  };

  if (loading) {
    return (
      <div className={styles.goalsContainer}>
        <p className={styles.stateMessage}>Loading goals…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.goalsContainer}>
        <p className={styles.stateMessage} style={{ color: "var(--error)" }}>
          Failed to load goals.
        </p>
        <Button onClick={refetch}>Retry</Button>
      </div>
    );
  }

  return (
    <div className={styles.goalsContainer}>
      <div className={styles.pageHeaderWrapper}>
        <div className="pageHeader">
          <h1>My Goals</h1>
          <p>Set and track your personal fitness targets</p>
        </div>
        <Button icon={<Plus size={18} />} onClick={() => setIsCreateOpen(true)}>
          New Goal
        </Button>
      </div>

      <div className={styles.statsGrid}>
        <StatCard
          title="Total Goals"
          value={summary.totalGoals.toString()}
          icon={<Target size={24} />}
          variant="blue"
        />
        <StatCard
          title="On Track"
          value={summary.onTrack.toString()}
          icon={<CheckCircle size={24} />}
          variant="green"
        />
        <StatCard
          title="Avg. Progress"
          value={`${summary.avgProgress}%`}
          icon={<TrendingUp size={24} />}
          variant="purple"
        />
      </div>

      <div className={styles.goalsList}>
        {goals.length === 0 ? (
          <p className={styles.stateMessage}>
            No goals yet — hit <strong>New Goal</strong> to get started!
          </p>
        ) : (
          goals.map((goal) => (
            <GoalCard
              key={goal.id}
              title={goal.title}
              tag={frequencyLabel[goal.frequency] ?? goal.frequency}
              description={goal.description ?? ""}
              current={goal.currentValue}
              total={goal.targetValue}
              unit={goal.unit}
              remainingText={remainingText(goal)}
              color={goalColor(goal)}
              progressText={`${goal.progressPct}% Complete`}
              onEdit={() => handleEditClick(goal)}
              onDelete={() => handleDelete(goal.id)}
            />
          ))
        )}

        <LogActivity goals={goals} onLog={handleLogActivity} />
      </div>

      <CreateGoalModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleGoalCreated}
      />

      <EditGoalModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={handleEditSaved}
        goal={selectedGoal}
      />
    </div>
  );
};

export default GoalsPage;
