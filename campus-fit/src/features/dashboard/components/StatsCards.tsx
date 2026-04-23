import type { DashboardStats } from '../../../types';
import StepsIcon from '../../../assets/steps-icon';
import CalendarIcon from '../../../assets/calendar-icon';
import CaloriesBurnedIcon from '../../../assets/calories-burned-icom';
import WorkoutsIcon from '../../../assets/workouts-icon';
import styles from './StatsCards.module.scss';

interface StatsCardsProps {
  stats: DashboardStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className={styles.statsGrid}>
      <div className={styles.card}>
        <span className={styles.cardLabel}>Today's Steps</span>
        <span className={styles.cardValue}>{stats.todaySteps.toLocaleString()}</span>
        <div className={styles.cardIcon} aria-hidden="true"><StepsIcon /></div>
      </div>

      <div className={styles.card}>
        <span className={styles.cardLabel}>Calories Burned</span>
        <span className={styles.cardValue}>{stats.todayCalories.toLocaleString()}</span>
        <span className={styles.cardIcon} aria-hidden="true"><CaloriesBurnedIcon /></span>
      </div>

      <div className={`${styles.card}`}>
        <span className={styles.cardLabel}>Weekly Workouts</span>
        <span className={styles.cardValue}>
          {stats.weeklyWorkoutsCurrent}/{stats.weeklyWorkoutsTarget}
        </span>
        <span className={styles.cardSub}>
          {Math.max(0, stats.weeklyWorkoutsTarget - stats.weeklyWorkoutsCurrent)} more to reach goal
        </span>
        <div className={styles.cardIcon} aria-hidden="true"><WorkoutsIcon /></div>
      </div>

      <div className={styles.card}>
        <span className={styles.cardLabel}>Active Goals</span>
        <span className={styles.cardValue}>{stats.activeGoals}</span>
        <button className={styles.addGoalBtn}>+ Add Goal</button>
        <div className={styles.cardIcon} aria-hidden="true"><CalendarIcon /></div>
      </div>
    </div>
  );
}
