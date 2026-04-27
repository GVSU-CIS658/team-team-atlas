import { useCallback, useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import type {
  DashboardStats,
  WeeklyStepDay,
  RecentActivity,
  ActiveChallenge,
} from '../../../types';

interface DashboardData {
  stats: DashboardStats | null;
  weeklySteps: WeeklyStepDay[];
  recentActivity: RecentActivity[];
  activeChallenges: ActiveChallenge[];
  loading: boolean;
  error: unknown;
  refetch: () => Promise<void>;
}

export function useDashboard(): DashboardData {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [weeklySteps, setWeeklySteps] = useState<WeeklyStepDay[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<ActiveChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, stepsData, activityData, challengesData] = await Promise.all([
        api.get<DashboardStats>('/dashboard/stats'),
        api.get<WeeklyStepDay[]>('/dashboard/weekly-steps'),
        api.get<RecentActivity[]>('/dashboard/recent-activity'),
        api.get<ActiveChallenge[]>('/dashboard/active-challenges'),
      ]);
      setStats(statsData);
      setWeeklySteps(stepsData);
      setRecentActivity(activityData);
      setActiveChallenges(challengesData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    stats,
    weeklySteps,
    recentActivity,
    activeChallenges,
    loading,
    error,
    refetch: fetchDashboard,
  };
}
