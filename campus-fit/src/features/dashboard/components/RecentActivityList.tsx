import type { RecentActivity } from '../../../types';
import WorkoutsIcon from '../../../assets/workouts-icon';
import styles from './RecentActivityList.module.scss';

interface RecentActivityListProps {
  activities: RecentActivity[];
}

const ACTIVITY_ICONS: Record<string, string> = {
  steps: '🚶',
  miles: '🏃',
  workouts: '💪',
  calories: '🔥',
};

export default function RecentActivityList({ activities }: RecentActivityListProps) {
  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Recent Activity</h3>
        <p className={styles.subtitle}>Your latest workout sessions</p>
      </div>

      <ul className={styles.list}>
        {activities.length === 0 && (
          <li className={styles.empty}>No activity logged yet</li>
        )}
        {activities.map((activity) => (
          <li key={activity.id} className={styles.item}>
            <div className={styles.icon} aria-hidden="true">
              <WorkoutsIcon containerColor='#DBEAFE' iconFillColor='#155DFC' />
            </div>
            <div className={styles.info}>
              <span className={styles.activityTitle}>
                {activity.goal?.title ?? 'Activity'}
              </span>
              <span className={styles.activityDetail}>
                {activity.value.toLocaleString()} {activity.goal?.unit ?? ''}
                {activity.notes ? ` · ${activity.notes}` : ''}
              </span>
            </div>
            <span className={styles.date}>
              {formatDate(activity.date)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function formatDate(dateStr: string): string {
  const raw = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const date = new Date(raw + 'T12:00:00');
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
