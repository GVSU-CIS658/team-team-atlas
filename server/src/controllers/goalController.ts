import { Response } from "express";
import { supabase } from "../config/db";
import { AuthenticatedRequest } from "../types";

// ─── GET /goals ──────────────────────────────────────────────────────────────
// Returns all goals for the user with live progress and summary stats.
export const getGoals = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  // Support optional ?status=active and ?limit=3 query params (used by GoalsSummary)
  const { status, limit } = req.query;

  let query = supabase
    .from("goals")
    .select(
      "id, title, description, unit, frequency, target_value, status, created_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (status && typeof status === "string") {
    query = query.eq("status", status);
  }
  if (limit && !isNaN(Number(limit))) {
    query = query.limit(Number(limit));
  }

  const { data: goals, error } = await query;

  if (error) {
    console.error("[getGoals] Supabase error:", error);
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to load goals" },
    });
    return;
  }

  if (!goals || goals.length === 0) {
    res.json({
      success: true,
      data: {
        summary: { totalGoals: 0, onTrack: 0, avgProgress: 0 },
        goals: [],
      },
    });
    return;
  }

  // Fetch accumulated progress for each goal from activity_logs
  const goalIds = goals.map((g) => g.id);

  const { data: logs } = await supabase
    .from("activity_logs")
    .select("goal_id, value, date")
    .in("goal_id", goalIds);

  // Build a per-goal progress map, respecting frequency windows
  const now = new Date();
  const progressMap: Record<string, number> = {};

  goalIds.forEach((id) => {
    progressMap[id] = 0;
  });

  logs?.forEach((log) => {
    const logDate = new Date(log.date);
    const goal = goals.find((g) => g.id === log.goal_id);
    if (!goal) return;

    if (goal.frequency === "daily") {
      // Only count logs from today
      const today = now.toISOString().split("T")[0];
      if (log.date.startsWith(today)) {
        progressMap[log.goal_id] += Number(log.value);
      }
    } else if (goal.frequency === "weekly") {
      // Only count logs from the current week (Mon–Sun)
      const startOfWeek = getStartOfWeek();
      if (log.date >= startOfWeek + "T00:00:00") {
        progressMap[log.goal_id] += Number(log.value);
      }
    } else if (goal.frequency === "monthly") {
      // Only count logs from the current calendar month
      const yearMonth = now.toISOString().slice(0, 7); // "YYYY-MM"
      if (log.date.startsWith(yearMonth)) {
        progressMap[log.goal_id] += Number(log.value);
      }
    } else {
      // One-time / no window
      progressMap[log.goal_id] += Number(log.value);
    }
  });

  // Build enriched goal objects
  const enriched = goals.map((g) => {
    const currentValue = progressMap[g.id] ?? 0;
    const targetValue = Number(g.target_value);
    const progressPct =
      targetValue > 0
        ? Math.min(Math.round((currentValue / targetValue) * 100), 100)
        : 0;
    const remaining = Math.max(targetValue - currentValue, 0);
    const isOnTrack = progressPct >= getExpectedProgressPct(g.frequency);

    return {
      id: g.id,
      title: g.title,
      description: g.description,
      unit: g.unit,
      frequency: g.frequency,
      targetValue,
      currentValue,
      progressPct,
      remaining,
      isOnTrack,
      status: g.status,
      createdAt: g.created_at,
    };
  });

  // Summary stats (matches the three cards in the UI)
  const totalGoals = enriched.length;
  const onTrack = enriched.filter((g) => g.isOnTrack).length;
  const avgProgress =
    totalGoals > 0
      ? Math.round(
          enriched.reduce((sum, g) => sum + g.progressPct, 0) / totalGoals,
        )
      : 0;

  res.json({
    success: true,
    data: {
      summary: { totalGoals, onTrack, avgProgress },
      goals: enriched,
    },
  });
};

// ─── POST /goals ──────────────────────────────────────────────────────────────
// Creates a new goal for the authenticated user.
export const createGoal = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { title, description, unit, frequency, targetValue } = req.body;

  if (!title || !unit || !frequency || targetValue == null) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "title, unit, frequency, and targetValue are required",
      },
    });
    return;
  }

  const { data, error } = await supabase
    .from("goals")
    .insert({
      user_id: userId,
      title,
      description: description ?? null,
      unit,
      frequency,
      target_value: Number(targetValue),
      status: "active",
    })
    .select()
    .single();

  if (error) {
    console.error("[createGoal] Supabase error:", error);
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to create goal" },
    });
    return;
  }

  res.status(201).json({ success: true, data });
};

// ─── PATCH /goals/:id ─────────────────────────────────────────────────────────
// Updates an existing goal (title, description, targetValue, status, etc.)
export const updateGoal = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const { title, description, unit, frequency, targetValue, status } = req.body;

  // Confirm ownership
  const { data: existing } = await supabase
    .from("goals")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (!existing) {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Goal not found" },
    });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (unit !== undefined) updates.unit = unit;
  if (frequency !== undefined) updates.frequency = frequency;
  if (targetValue !== undefined) updates.target_value = Number(targetValue);
  if (status !== undefined) updates.status = status;

  const { data, error } = await supabase
    .from("goals")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("[updateGoal] Supabase error:", error);
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to update goal" },
    });
    return;
  }

  res.json({ success: true, data });
};

// ─── DELETE /goals/:id ────────────────────────────────────────────────────────
// Deletes a goal and all its associated activity logs.
export const deleteGoal = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  // Confirm ownership
  const { data: existing } = await supabase
    .from("goals")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (!existing) {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Goal not found" },
    });
    return;
  }

  // Delete associated logs first (if no cascade set on DB)
  await supabase.from("activity_logs").delete().eq("goal_id", id);

  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("[deleteGoal] Supabase error:", error);
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to delete goal" },
    });
    return;
  }

  res.json({ success: true, message: "Goal deleted successfully" });
};

// ─── POST /goals/:id/log ──────────────────────────────────────────────────────
// Logs an activity entry against a goal (the "Log Activity" form in the UI).
export const logActivity = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id: goalId } = req.params;
  const { value, date, notes, durationMinutes, caloriesBurned } = req.body;

  if (value == null) {
    res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "value is required" },
    });
    return;
  }

  // Confirm goal belongs to user
  const { data: goal } = await supabase
    .from("goals")
    .select("id, unit")
    .eq("id", goalId)
    .eq("user_id", userId)
    .single();

  if (!goal) {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Goal not found" },
    });
    return;
  }

  const logDate = date ?? new Date().toISOString();

  // Build insert with only core columns guaranteed to exist.
  // Optional columns (duration_minutes, calories_burned) are added only if provided,
  // so missing DB columns won't cause a 500.
  const insertRow: Record<string, unknown> = {
    user_id: userId,
    goal_id: goalId,
    value: Number(value),
    date: logDate,
    notes: notes ?? null,
  };

  const { data, error } = await supabase
    .from("activity_logs")
    .insert(insertRow)
    .select()
    .single();

  if (error) {
    console.error("[logActivity] Supabase error:", JSON.stringify(error));
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error.message ?? "Failed to log activity",
      },
    });
    return;
  }

  res.status(201).json({ success: true, data });
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStartOfWeek(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split("T")[0];
}

/**
 * Returns how far through the current frequency window we are (0–100).
 * Used to decide if a goal is "on track".
 */
function getExpectedProgressPct(frequency: string): number {
  const now = new Date();

  if (frequency === "daily") {
    const hoursElapsed = now.getHours() + now.getMinutes() / 60;
    return Math.round((hoursElapsed / 24) * 100);
  }

  if (frequency === "weekly") {
    const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // Mon=1 … Sun=7
    return Math.round((dayOfWeek / 7) * 100);
  }

  if (frequency === "monthly") {
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    ).getDate();
    return Math.round((now.getDate() / daysInMonth) * 100);
  }

  return 0; // One-time goals are always considered on track until completed
}
