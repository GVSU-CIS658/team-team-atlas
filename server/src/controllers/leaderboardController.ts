import { Response } from "express";
import { supabase } from "../config/db";
import { AuthenticatedRequest } from "../types";

// ─── GET /leaderboard/:challengeId ───────────────────────────────────────────
// Returns the full ranked leaderboard for a challenge, plus the current
// user's position, progress, and how much they need to overtake the next rank.
export const getChallengeLeaderboard = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const userId = req.user!.id;
  const { challengeId } = req.params;

  // 1. Confirm challenge exists
  const { data: challenge, error: challengeErr } = await supabase
    .from("challenges")
    .select("id, title, unit, description, start_date, end_date")
    .eq("id", challengeId)
    .single();

  if (challengeErr || !challenge) {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Challenge not found" },
    });
    return;
  }

  // 2. All participants + usernames (via foreign key join)
  const { data: participants, error: partErr } = await supabase
    .from("challenge_participants")
    .select("user_id, users(username)")
    .eq("challenge_id", challengeId);

  if (partErr) {
    console.error("[getChallengeLeaderboard] participants error:", partErr);
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to load leaderboard" },
    });
    return;
  }

  const userIds = participants?.map((p) => p.user_id) ?? [];

  // 3. All progress entries for this challenge
  const { data: progress } = await supabase
    .from("challenge_progress")
    .select("user_id, value, date")
    .eq("challenge_id", challengeId)
    .in("user_id", userIds.length > 0 ? userIds : ["__none__"]);

  // 4. Aggregate totals per user
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

  // 5. Sort descending by total → assign ranks
  const ranked = (participants ?? [])
    .map((p) => ({
      userId: p.user_id,
      username: (p.users as any)?.username ?? "Unknown",
      totalProgress: aggMap[p.user_id]?.total ?? 0,
      lastActivityDate: aggMap[p.user_id]?.lastDate ?? null,
    }))
    .sort((a, b) => b.totalProgress - a.totalProgress)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));

  // 6. Current user's position
  const myEntry = ranked.find((e) => e.userId === userId);
  const myRank = myEntry?.rank ?? null;
  const myProgress = myEntry?.totalProgress ?? 0;

  // "To Next Rank" — how many more units to overtake the person directly above
  const personAbove =
    myRank && myRank > 1 ? ranked.find((e) => e.rank === myRank - 1) : null;
  const toNextRank =
    personAbove != null ? personAbove.totalProgress - myProgress + 1 : null;

  res.json({
    success: true,
    data: {
      challenge: {
        id: challenge.id,
        title: challenge.title,
        unit: challenge.unit,
        description: challenge.description,
        startDate: challenge.start_date,
        endDate: challenge.end_date,
      },
      myPosition: {
        rank: myRank,
        progress: myProgress,
        toNextRank, // null means user is already #1
      },
      leaderboard: ranked, // full sorted list
    },
  });
};

// ─── GET /leaderboard/joined ─────────────────────────────────────────────────
// Returns the minimal challenge list the user has joined — used to populate
// the challenge selector dropdown on the leaderboard page.
export const getJoinedChallenges = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const userId = req.user!.id;

  const { data, error } = await supabase
    .from("challenge_participants")
    .select("challenge_id, challenges(id, title, unit)")
    .eq("user_id", userId);

  if (error) {
    console.error("[getJoinedChallenges] error:", error);
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to load challenges" },
    });
    return;
  }

  const challenges = (data ?? []).map((row) => ({
    id: (row.challenges as any)?.id ?? row.challenge_id,
    title: (row.challenges as any)?.title ?? "Untitled",
    unit: (row.challenges as any)?.unit ?? "",
  }));

  res.json({ success: true, data: challenges });
};
