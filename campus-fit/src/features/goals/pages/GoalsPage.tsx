import { Target, CheckCircle, TrendingUp, Plus } from "lucide-react";
import styles from "./Goals.module.scss";
import StatCard from "../../../components/ui/StatCard/StartCard";
import GoalCard from "../../../components/ui/GoalCard/GoalCard";
import LogActivity from "../../../components/ui/LogActivity/LogActivity";
import Button from "../../../components/ui/Button/Button";

const GoalsPage = () => {
  return (
    <div className={styles.goalsContainer}>
      <div className={styles.pageHeaderWrapper}>
        <div className="pageHeader">
          <h1>My Goals</h1>
          <p>Set and track your personal fitness targets</p>
        </div>
        <Button icon={<Plus size={18} />}>New Goal</Button>
      </div>

      <div className={styles.statsGrid}>
        <StatCard
          title="Total Goals"
          value="3"
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
        <GoalCard
          title="Daily Steps"
          tag="Daily"
          description="Walk 10,000 steps every day"
          current={7500}
          total={10000}
          unit="steps"
          progressText="75% Complete"
          remainingText="2,500 steps to go"
          color="#111"
        />
        <GoalCard
          title="Weekly Workouts"
          tag="Weekly"
          description="Complete 5 sessions"
          current={2}
          total={5}
          unit="workouts"
          progressText="40% Complete"
          remainingText="3 sessions to go"
          color="#155dfc"
        />
        <GoalCard
          title="Monthly Running"
          tag="Monthly"
          description="Run 50 miles"
          current={5}
          total={50}
          unit="miles"
          progressText="10% Complete"
          remainingText="45 miles to go"
          color="#9810fa"
        />

        <LogActivity />
      </div>
    </div>
  );
};

export default GoalsPage;
