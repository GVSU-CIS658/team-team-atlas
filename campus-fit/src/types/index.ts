export interface DashboardStats {
  todaySteps: number;
  todayCalories: number;
  weeklyWorkoutsCurrent: number;
  weeklyWorkoutsTarget: number;
  activeGoals: number;
  totalGoals: number;
  activeChallenges: number;
}

export interface WeeklyStepDay {
  date: string;
  label: string;
  steps: number;
}

export interface RecentActivity {
  id: string;
  value: number;
  date: string;
  notes: string | null;
  createdAt: string;
  goal: {
    id: string;
    title: string;
    unit: string;
    frequency: string;
  } | null;
}

export interface ActiveChallenge {
  id: string;
  title: string;
  description: string;
  frequency: string;
  unit: string;
  startDate: string;
  endDate: string;
  targetValue: number;
  participantCount: number;
  userProgress: number;
  rank: number;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  targetValue: number;
  unit: string;
  frequency: string;
  status: 'active' | 'completed';
  createdAt: string;
}
