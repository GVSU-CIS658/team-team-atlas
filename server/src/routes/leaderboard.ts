import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  getChallengeLeaderboard,
  getJoinedChallenges,
} from "../controllers/leaderboardController";

const router = Router();

router.use(requireAuth);

router.get("/joined", getJoinedChallenges);

router.get("/:challengeId", getChallengeLeaderboard);

export default router;
