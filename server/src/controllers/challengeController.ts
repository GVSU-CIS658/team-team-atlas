import { Response } from "express";
import { supabase } from "../config/db";
import { AuthenticatedRequest } from "../types";

// ─── GET /challenges ──────────────────────────────────────────────────────────
export const getChallenges = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const userId = req.user!.id;
  const { joined } = req.query;

  const { data: challenges, error } = await supabase
    .from("challenges")
    .select(
      "id, title, description, frequency, unit, start_date, end_date, created_by, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getChallenges] Supabase error:", error);
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to load challenges" },
    });
    return;
  }

  if (!challenges || challenges.length === 0) {
    res.json({ success: true, data: [] });
    return;
  }

  const challengeIds = challenges.map((c) => c.id);

  const [{ data: participants }, { data: allProgress }] = await Promise.all([
    supabase
      .from("challenge_participants")
      .select("challenge_id, user_id")
      .in("challenge_id", challengeIds),
    supabase
      .from("challenge_progress")
      .select("challenge_id, user_id, value, date")
      .in("challenge_id", challengeIds),
  ]);

  const now = new Date();

  const enriched = challenges.map((c) => {
    const cParticipants =
      participants?.filter((p) => p.challenge_id === c.id) ?? [];
    const cProgress = allProgress?.filter((p) => p.challenge_id === c.id) ?? [];
    const isJoined = cParticipants.some((p) => p.user_id === userId);
    const participantCount = cParticipants.length;

    const userProgress = cProgress
      .filter((p) => p.user_id === userId)
      .reduce((sum, p) => sum + Number(p.value), 0);

    const totalsMap: Record<string, number> = {};
    cProgress.forEach((p) => {
      totalsMap[p.user_id] = (totalsMap[p.user_id] ?? 0) + Number(p.value);
    });
    const sortedTotals = Object.values(totalsMap).sort((a, b) => b - a);
    const rank = isJoined
      ? sortedTotals.findIndex((t) => t <= userProgress) + 1 || participantCount
      : null;

    const daysLeft = Math.ceil(
      (new Date(c.end_date).getTime() - now.getTime()) / 86_400_000,
    );

    return {
      id: c.id,
      title: c.title,
      description: c.description,
      frequency: c.frequency,
      unit: c.unit,
      startDate: c.start_date,
      endDate: c.end_date,
      participantCount,
      daysLeft,
      isJoined,
      userProgress,
      rank,
      createdBy: c.created_by,
      createdAt: c.created_at,
    };
  });

  const result =
    joined === "true"
      ? enriched.filter((c) => c.isJoined)
      : joined === "false"
        ? enriched.filter((c) => !c.isJoined)
        : enriched;

  res.json({ success: true, data: result });
};

// ─── POST /challenges/:id/join ────────────────────────────────────────────────
export const joinChallenge = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const userId = req.user!.id;
  const { id: challengeId } = req.params;

  const { data: challenge } = await supabase
    .from("challenges")
    .select("id")
    .eq("id", challengeId)
    .single();

  if (!challenge) {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Challenge not found" },
    });
    return;
  }

  const { data: existing } = await supabase
    .from("challenge_participants")
    .select("challenge_id")
    .eq("challenge_id", challengeId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    res.status(409).json({
      success: false,
      error: {
        code: "CONFLICT",
        message: "You have already joined this challenge",
      },
    });
    return;
  }

  const { error } = await supabase
    .from("challenge_participants")
    .insert({ challenge_id: challengeId, user_id: userId });

  if (error) {
    console.error("[joinChallenge] Supabase error:", error);
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to join challenge" },
    });
    return;
  }

  res.status(201).json({
    success: true,
    data: {
      challengeId,
      userId,
      joinedAt: new Date().toISOString(),
      totalProgress: 0,
    },
  });
};

// ─── POST /challenges/:id/leave ───────────────────────────────────────────────
export const leaveChallenge = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const userId = req.user!.id;
  const { id: challengeId } = req.params;

  const { error } = await supabase
    .from("challenge_participants")
    .delete()
    .eq("challenge_id", challengeId)
    .eq("user_id", userId);

  if (error) {
    console.error("[leaveChallenge] Supabase error:", error);
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to leave challenge" },
    });
    return;
  }

  res.json({ success: true, data: { message: "Left challenge" } });
};

// ─── POST /challenges/:id/progress ───────────────────────────────────────────
export const logProgress = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id: challengeId } = req.params;
  const { value, date, notes } = req.body;

  if (value == null || !date) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "value and date are required",
      },
    });
    return;
  }

  const { data: participant } = await supabase
    .from("challenge_participants")
    .select("challenge_id")
    .eq("challenge_id", challengeId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!participant) {
    res.status(403).json({
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "You must join this challenge before logging progress",
      },
    });
    return;
  }

  const { error } = await supabase.from("challenge_progress").insert({
    challenge_id: challengeId,
    user_id: userId,
    value: Number(value),
    date,
    notes: notes ?? null,
  });

  if (error) {
    console.error("[logProgress] Supabase error:", error);
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to log progress" },
    });
    return;
  }

  const { data: allProgress } = await supabase
    .from("challenge_progress")
    .select("value")
    .eq("challenge_id", challengeId)
    .eq("user_id", userId);

  const totalProgress =
    allProgress?.reduce((sum, p) => sum + Number(p.value), 0) ?? 0;

  res.status(201).json({
    success: true,
    data: { challengeId, userId, entryValue: value, date, totalProgress },
  });
};

// ─── GET /challenges/:id/leaderboard ─────────────────────────────────────────
export const getLeaderboard = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const { id: challengeId } = req.params;

  const { data: participants, error } = await supabase
    .from("challenge_participants")
    .select("user_id, users(username)")
    .eq("challenge_id", challengeId);

  if (error) {
    console.error("[getLeaderboard] Supabase error:", error);
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to load leaderboard" },
    });
    return;
  }

  const userIds = participants?.map((p) => p.user_id) ?? [];

  const { data: progress } = await supabase
    .from("challenge_progress")
    .select("user_id, value, date")
    .eq("challenge_id", challengeId)
    .in("user_id", userIds);

  const aggMap: Record<string, { total: number; lastDate: string | null }> = {};
  userIds.forEach((id) => {
    aggMap[id] = { total: 0, lastDate: null };
  });

  progress?.forEach((p) => {
    aggMap[p.user_id].total += Number(p.value);
    if (!aggMap[p.user_id].lastDate || p.date > aggMap[p.user_id].lastDate!) {
      aggMap[p.user_id].lastDate = p.date;
    }
  });

  const leaderboard = (participants ?? [])
    .map((p) => ({
      userId: p.user_id,
      username: (p.users as any)?.username ?? "Unknown",
      totalProgress: aggMap[p.user_id]?.total ?? 0,
      lastActivityDate: aggMap[p.user_id]?.lastDate ?? null,
    }))
    .sort((a, b) => b.totalProgress - a.totalProgress)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));

  res.json({ success: true, data: leaderboard });
};
