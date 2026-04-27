import { Router } from "express";

import { requireAuth } from "../middleware/auth";
import {
  createGoal,
  deleteGoal,
  getGoals,
  logActivity,
  updateGoal,
} from "../controllers/goalController";

const router = Router();

router.use(requireAuth);

router.get("/", getGoals);
router.post("/", createGoal);
router.patch("/:id", updateGoal);
router.delete("/:id", deleteGoal);
router.post("/:id/log", logActivity);

export default router;
