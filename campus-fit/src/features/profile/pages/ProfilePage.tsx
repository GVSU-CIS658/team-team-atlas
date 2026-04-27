import DashboardError from '../../../components/ui/DashboardError/DashboardError';
import PersonalInfoCard from '../components/PersonalInfoCard';
import ProfileStatsCards from '../components/ProfileStatsCards';
import ActivityBreakdown from '../components/ActivityBreakdown';
import { useProfile } from '../hooks/useProfile';
import styles from './Profile.module.scss';

export default function ProfilePage() {
    const { profile, stats, loading, error, refetch, save } = useProfile();

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.loading}>Loading your profile...</div>
            </div>
        );
    }

    if (error || !profile || !stats) {
        return (
            <div className={styles.page}>
                <DashboardError error={error} onRetry={refetch} />
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <header className="pageHeader">
                <h1 className={styles.heading}>Profile</h1>
                <p className={styles.subheading}>Manage your account and view your fitness stats</p>
            </header>

            <div className={styles.layout}>
                <div className={styles.infoCol}>
                    <PersonalInfoCard profile={profile} onSave={save} />
                </div>

                <div className={styles.contentCol}>
                    <ProfileStatsCards stats={stats} />
                    <ActivityBreakdown counts={stats.activityCountByUnit} />
                </div>
            </div>
        </div>
    );
}
