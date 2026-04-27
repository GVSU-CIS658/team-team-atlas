import { Response } from 'express';
import { supabase } from '../config/db';
import { AuthenticatedRequest } from '../types';

const USER_SELECT = 'id, username, email, university, created_at';

type ActivityUnit = 'steps' | 'calories' | 'distance';
const ACTIVITY_UNITS: ActivityUnit[] = ['steps', 'calories', 'distance'];

interface UserRow {
    id: string;
    username: string;
    email: string;
    university: string | null;
    created_at: string;
}

function toApiShape(user: UserRow) {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        university: user.university,
        createdAt: user.created_at,
    };
}

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.id;

    const { data, error } = await supabase
        .from('users')
        .select(USER_SELECT)
        .eq('id', userId)
        .single();

    if (error || !data) {
        console.error('[getMe] Supabase error:', error);
        res.status(404).json({
            success: false,
            error: { code: 'NOT_FOUND', message: 'User not found' },
        });
        return;
    }

    res.status(200).json({ success: true, data: toApiShape(data as UserRow) });
};

export const updateMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { username, university } = req.body ?? {};

    const updates: { username?: string; university?: string | null } = {};

    if (username !== undefined) {
        if (typeof username !== 'string' || !username.trim()) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'username must be a non-empty string',
                    details: [{ field: 'username', reason: 'must be a non-empty string' }],
                },
            });
            return;
        }
        updates.username = username.trim();
    }

    if (university !== undefined) {
        if (university === null) {
            updates.university = null;
        } else if (typeof university === 'string') {
            const trimmed = university.trim();
            updates.university = trimmed.length > 0 ? trimmed : null;
        } else {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'university must be a string or null',
                    details: [{ field: 'university', reason: 'must be a string or null' }],
                },
            });
            return;
        }
    }

    if (Object.keys(updates).length === 0) {
        res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'No updatable fields provided',
            },
        });
        return;
    }

    const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select(USER_SELECT)
        .single();

    if (error || !data) {
        console.error('[updateMe] Supabase error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'INTERNAL_ERROR', message: 'Failed to update profile' },
        });
        return;
    }

    res.status(200).json({ success: true, data: toApiShape(data as UserRow) });
};

export const getMyStatistics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.id;

    const [goalsResult, activitiesResult, challengesResult] = await Promise.all([
        supabase
            .from('goals')
            .select('id, status, unit')
            .eq('user_id', userId),
        supabase
            .from('activity_logs')
            .select('value, goal_id')
            .eq('user_id', userId),
        supabase
            .from('challenge_participants')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId),
    ]);

    const goals = goalsResult.data ?? [];
    const activities = activitiesResult.data ?? [];
    const goalById = new Map(goals.map((g) => [g.id, g]));

    const activityCountByUnit: Record<ActivityUnit, number> = {
        steps: 0,
        calories: 0,
        distance: 0,
    };

    let totalCaloriesBurned = 0;

    for (const a of activities) {
        const goal = goalById.get(a.goal_id);
        if (!goal) continue;
        const unit = goal.unit as string;
        const val = Number(a.value) || 0;

        if (ACTIVITY_UNITS.includes(unit as ActivityUnit)) {
            activityCountByUnit[unit as ActivityUnit] += 1;
        }

        if (unit === 'calories') {
            totalCaloriesBurned += val;
        }
    }

    res.status(200).json({
        success: true,
        data: {
            totalWorkouts: activities.length,
            totalCaloriesBurned,
            completedGoals: goals.filter((g) => g.status === 'completed').length,
            activeChallenges: challengesResult.count ?? 0,
            activityCountByUnit,
        },
    });
};
