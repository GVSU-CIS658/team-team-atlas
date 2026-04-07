import { useState, type FC } from "react";
import { Target, CheckCircle, TrendingUp, Plus } from "lucide-react";
import styles from "./Goals.module.scss";
import StatCard from "../../../components/ui/StatCard/StartCard";
import GoalCard from "../../../components/ui/GoalCard/GoalCard";
import LogActivity from "../../../components/ui/LogActivity/LogActivity";
import Button from "../../../components/ui/Button/Button";
import CreateGoalModal from "./CreateGoalModal";
import EditGoalModal from "../../../components/ui/GoalCard/EditGoalModal";

interface Goal {
  id: string;
  title: string;
  tag: string;
  description: string;
  current: number;
  total: number;
  unit: string;
  color?: string;
  remainingText: string;
}

const GoalsPage: FC = () => {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "1",
      title: "Daily Steps",
      tag: "Daily",
      description: "Walk 10,000 steps every day",
      current: 7500,
      total: 10000,
      unit: "steps",
      remainingText: "2,500 steps to go",
      color: "#111",
    },
    {
      id: "2",
      title: "Weekly Workouts",
      tag: "Weekly",
      description: "Complete 5 sessions",
      current: 2,
      total: 5,
      unit: "workouts",
      remainingText: "3 sessions to go",
      color: "#155dfc",
    },
    {
      id: "3",
      title: "Monthly Running",
      tag: "Monthly",
      description: "Run 50 miles",
      current: 5,
      total: 50,
      unit: "miles",
      remainingText: "45 miles to go",
      color: "#9810fa",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);

  const toggleModal = () => setIsModalOpen((prev) => !prev);

  const handleEditClick = (goal: Goal) => {
    setSelectedGoal({
      title: goal.title,
      description: goal.description,
      targetValue: goal.total,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <div className={styles.goalsContainer}>
      <div className={styles.pageHeaderWrapper}>
        <div className="pageHeader">
          <h1>My Goals</h1>
          <p>Set and track your personal fitness targets</p>
        </div>
        <Button icon={<Plus size={18} />} onClick={toggleModal}>
          New Goal
        </Button>
      </div>

      <div className={styles.statsGrid}>
        <StatCard
          title="Total Goals"
          value={goals.length.toString()}
          icon={<Target size={24} />}
          variant="blue"
        />
        <StatCard
          title="On Track"
          value="2"
          icon={<CheckCircle size={24} />}
          variant="green"
        />
        <StatCard
          title="Avg. Progress"
          value="61%"
          icon={<TrendingUp size={24} />}
          variant="purple"
        />
      </div>

      <div className={styles.goalsList}>
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            title={goal.title}
            tag={goal.tag}
            description={goal.description}
            current={goal.current}
            total={goal.total}
            unit={goal.unit}
            remainingText={goal.remainingText}
            color={goal.color}
            progressText={`${Math.round((goal.current / goal.total) * 100)}% Complete`}
            onEdit={() => handleEditClick(goal)}
            onDelete={() => handleDeleteGoal(goal.id)}
          />
        ))}

        <LogActivity />
      </div>

      <CreateGoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <EditGoalModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={selectedGoal}
      />
    </div>
  );
};

export default GoalsPage;
