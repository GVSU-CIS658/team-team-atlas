import { Router } from "express";
import {
  getChallenges,
  joinChallenge,
  leaveChallenge,
  logProgress,
  getLeaderboard,
} from "../controllers/challengeController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", getChallenges);
router.post("/:id/join", joinChallenge);
router.post("/:id/leave", leaveChallenge);
router.post("/:id/progress", logProgress);
router.get("/:id/leaderboard", getLeaderboard);

export default router;
