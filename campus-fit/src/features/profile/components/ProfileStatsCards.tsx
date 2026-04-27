import { Trophy } from 'lucide-react';
import WorkoutsIcon from '../../../assets/workouts-icon';
import CaloriesBurnedIcon from '../../../assets/calories-burned-icom';
import CalendarIcon from '../../../assets/calendar-icon';
import type { UserStatistics } from '../../../types';
import styles from './ProfileStatsCards.module.scss';

interface ProfileStatsCardsProps {
    stats: UserStatistics;
}

export default function ProfileStatsCards({ stats }: ProfileStatsCardsProps) {
    return (
        <div className={styles.statsGrid}>
            <div className={styles.card}>
                <span className={styles.cardLabel}>Total Workouts</span>
                <span className={`${styles.cardValue} ${styles.workoutsValue}`}>
                    {stats.totalWorkouts.toLocaleString()}
                </span>
            </div>

            <div className={styles.card}>
                <span className={styles.cardLabel}>Calories Burned</span>
                <span className={`${styles.cardValue} ${styles.caloriesValue}`}>
                    {stats.totalCaloriesBurned.toLocaleString()}
                </span>
            </div>

            <div className={styles.card}>
                <span className={styles.cardLabel}>Goals Completed</span>
                <span className={`${styles.cardValue} ${styles.goalsValue}`}>
                    {stats.completedGoals.toLocaleString()}
                </span>
            </div>

            <div className={styles.card}>
                <span className={styles.cardLabel}>Active Challenges</span>
                <span className={`${styles.cardValue} ${styles.challengesValue}`}>
                    {stats.activeChallenges.toLocaleString()}
                </span>
            </div>
        </div>
    );
}
