import { Response } from 'express';
import { supabase } from '../config/db';
import { AuthenticatedRequest } from '../types';

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  const today = new Date().toISOString().split('T')[0];

  const [goalsResult, activitiesResult, challengesResult, todayStepsResult, todayCaloriesResult] = await Promise.all([
    supabase.from('goals').select('id, status').eq('user_id', userId),
    supabase.from('activity_logs').select('id').eq('user_id', userId),
    supabase
      .from('challenge_participants')
      .select('id')
      .eq('user_id', userId),
    supabase
      .from('activity_logs')
      .select('value')
      .eq('user_id', userId)
      .gte('date', today + 'T00:00:00')
      .lte('date', today + 'T23:59:59')
      .in('goal_id', 
        (await supabase.from('goals').select('id').eq('user_id', userId).eq('unit', 'steps')).data?.map(g => g.id) ?? []
      ),
    supabase
      .from('activity_logs')
      .select('value')
      .eq('user_id', userId)
      .gte('date', today + 'T00:00:00')
      .lte('date', today + 'T23:59:59')
      .in('goal_id',
        (await supabase.from('goals').select('id').eq('user_id', userId).eq('unit', 'calories')).data?.map(g => g.id) ?? []
      ),
  ]);

  const todaySteps = todayStepsResult.data?.reduce((sum, a) => sum + Number(a.value), 0) ?? 0;
  const todayCalories = todayCaloriesResult.data?.reduce((sum, a) => sum + Number(a.value), 0) ?? 0;
  const totalGoals = goalsResult.data?.length ?? 0;
  const activeGoals = goalsResult.data?.filter(g => g.status === 'active').length ?? 0;
  const activeChallenges = challengesResult.data?.length ?? 0;

  const weeklyWorkoutsGoal = await supabase
    .from('goals')
    .select('id, target_value')
    .eq('user_id', userId)
    .eq('unit', 'workouts')
    .eq('frequency', 'weekly')
    .limit(1)
    .single();

  let weeklyWorkoutsCurrent = 0;
  let weeklyWorkoutsTarget = 0;
  if (weeklyWorkoutsGoal.data) {
    weeklyWorkoutsTarget = Number(weeklyWorkoutsGoal.data.target_value);
    const startOfWeek = getStartOfWeek();
    const wResult = await supabase
      .from('activity_logs')
      .select('value')
      .eq('goal_id', weeklyWorkoutsGoal.data.id)
      .gte('date', startOfWeek + 'T00:00:00');
    weeklyWorkoutsCurrent = wResult.data?.reduce((sum, a) => sum + Number(a.value), 0) ?? 0;
  }

  res.json({
    success: true,
    data: {
      todaySteps,
      todayCalories,
      weeklyWorkoutsCurrent,
      weeklyWorkoutsTarget,
      activeGoals,
      totalGoals,
      activeChallenges,
    },
  });
};

export const getWeeklySteps = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const startOfWeek = getStartOfWeek();
  const endOfWeek = getEndOfWeek();

  const stepGoals = await supabase
    .from('goals')
    .select('id')
    .eq('user_id', userId)
    .eq('unit', 'steps');

  const goalIds = stepGoals.data?.map(g => g.id) ?? [];

  if (goalIds.length === 0) {
    res.json({ success: true, data: getEmptyWeek() });
    return;
  }

  const { data: activities } = await supabase
    .from('activity_logs')
    .select('value, date')
    .in('goal_id', goalIds)
    .gte('date', startOfWeek + 'T00:00:00')
    .lte('date', endOfWeek + 'T23:59:59');

  const dayTotals: Record<string, number> = {};
  const days = getLast7Days();
  days.forEach(d => { dayTotals[d] = 0; });

  activities?.forEach(a => {
    const dayKey = new Date(a.date).toISOString().split('T')[0];
    if (dayTotals[dayKey] !== undefined) {
      dayTotals[dayKey] += Number(a.value);
    }
  });

  const weeklyData = days.map(date => ({
    date,
    label: new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
    steps: dayTotals[date],
  }));

  res.json({ success: true, data: weeklyData });
};

export const getRecentActivity = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  const { data: activities } = await supabase
    .from('activity_logs')
    .select(`
      id,
      value,
      date,
      notes,
      created_at,
      goals ( id, title, unit, frequency )
    `)
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(10);

  const formatted = activities?.map(a => ({
    id: a.id,
    value: a.value,
    date: a.date,
    notes: a.notes,
    createdAt: a.created_at,
    goal: a.goals ? {
      id: (a.goals as any).id,
      title: (a.goals as any).title,
      unit: (a.goals as any).unit,
      frequency: (a.goals as any).frequency,
    } : null,
  })) ?? [];

  res.json({ success: true, data: formatted });
};

export const getActiveChallenges = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const now = new Date().toISOString();

  const { data: participations, error: participationsError } = await supabase
    .from('challenge_participants')
    .select(`
      total_progress,
      challenge_id,
      challenges ( id, title, description, frequency, unit, start_date, end_date, target_value )
    `)
    .eq('user_id', userId);

  if (participationsError) {
    console.error('[getActiveChallenges] Supabase error:', participationsError);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to load active challenges' },
    });
    return;
  }

  const activeChallenges = participations
    ?.filter(p => {
      const challenge = p.challenges as any;
      return challenge && new Date(challenge.end_date) >= new Date(now);
    })
    .map(p => {
      const c = p.challenges as any;
      return {
        id: c.id,
        title: c.title,
        description: c.description,
        frequency: c.frequency,
        unit: c.unit,
        startDate: c.start_date,
        endDate: c.end_date,
        targetValue: c.target_value != null ? Number(c.target_value) : 0,
        challengeId: p.challenge_id,
        userProgress: Number(p.total_progress),
      };
    }) ?? [];

  const withCounts = await Promise.all(
    activeChallenges.map(async challenge => {
      const [{ count: participantCount }, { count: aheadCount }] = await Promise.all([
        supabase
          .from('challenge_participants')
          .select('*', { count: 'exact', head: true })
          .eq('challenge_id', challenge.challengeId),
        supabase
          .from('challenge_participants')
          .select('*', { count: 'exact', head: true })
          .eq('challenge_id', challenge.challengeId)
          .gt('total_progress', challenge.userProgress),
      ]);

      const { challengeId: _, ...rest } = challenge;
      return {
        ...rest,
        participantCount: participantCount ?? 0,
        rank: (aheadCount ?? 0) + 1,
      };
    })
  );

  res.json({ success: true, data: withCounts });
};

function getStartOfWeek(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}

function getEndOfWeek(): string {
  const start = new Date(getStartOfWeek());
  start.setDate(start.getDate() + 6);
  return start.toISOString().split('T')[0];
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function getEmptyWeek() {
  return getLast7Days().map(date => ({
    date,
    label: new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
    steps: 0,
  }));
}
