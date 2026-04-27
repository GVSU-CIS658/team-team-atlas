import { useDashboard } from '../hooks/useDashboard';
import StatsCards from '../components/StatsCards';
import WeeklyStepsChart from '../components/WeeklyStepsChart';
import GoalsSummary from '../components/GoalsSummary';
import RecentActivityList from '../components/RecentActivityList';
import ActiveChallengesList from '../components/ActiveChallengesList';
import DashboardError from '../../../components/ui/DashboardError/DashboardError';
import styles from './Dasboard.module.scss';

export default function DashboardPage() {
  const { stats, weeklySteps, recentActivity, activeChallenges, loading, error, refetch } = useDashboard();

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading your dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <DashboardError error={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className="pageHeader">
        <h1 className={styles.heading}>Welcome back!</h1>
        <p className={styles.subheading}>Here's your fitness overview for today</p>
      </header>

      {stats && <StatsCards stats={stats} />}

      <div className={styles.middleRow}>
        <div className={styles.chartCol}>
          <WeeklyStepsChart data={weeklySteps} />
        </div>
        <div className={styles.goalsCol}>
          <GoalsSummary />
        </div>
      </div>

      <div className={styles.bottomRow}>
        <div className={styles.activityCol}>
          <RecentActivityList activities={recentActivity} />
        </div>
        <div className={styles.challengesCol}>
          <ActiveChallengesList challenges={activeChallenges} />
        </div>
      </div>
    </div>
  );
}
