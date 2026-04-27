import { useCallback, useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { useAuth } from '../../auth/context/AuthContext';
import type { UserProfile, UserStatistics } from '../../../types';

export interface ProfileSavePayload {
    username?: string;
    university?: string | null;
}

export interface UseProfileResult {
    profile: UserProfile | null;
    stats: UserStatistics | null;
    loading: boolean;
    error: unknown;
    refetch: () => Promise<void>;
    save: (updates: ProfileSavePayload) => Promise<UserProfile>;
}

export function useProfile(): UseProfileResult {
    const { updateUser } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<UserStatistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<unknown>(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [profileData, statsData] = await Promise.all([
                api.get<UserProfile>('/users/me'),
                api.get<UserStatistics>('/users/me/statistics'),
            ]);
            setProfile(profileData);
            setStats(statsData);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const save = useCallback(async (updates: ProfileSavePayload) => {
        const updated = await api.patch<UserProfile>('/users/me', updates);
        setProfile(updated);
        updateUser({ username: updated.username, email: updated.email });
        return updated;
    }, [updateUser]);

    return { profile, stats, loading, error, refetch: fetchAll, save };
}
