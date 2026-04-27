import { useCallback, useEffect, useState } from "react";
import { api } from "../../../lib/api";
import type { Goal, GoalSummary } from "../../../types";

interface GoalsData {
  summary: GoalSummary;
  goals: Goal[];
  loading: boolean;
  error: unknown;
  refetch: () => Promise<void>;
}

const DEFAULT_SUMMARY: GoalSummary = {
  totalGoals: 0,
  onTrack: 0,
  avgProgress: 0,
};

export function useGoals(): GoalsData {
  const [summary, setSummary] = useState<GoalSummary>(DEFAULT_SUMMARY);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<{ summary: GoalSummary; goals: Goal[] }>(
        "/goals",
      );
      setSummary(data.summary);
      setGoals(data.goals);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return { summary, goals, loading, error, refetch: fetchGoals };
}
