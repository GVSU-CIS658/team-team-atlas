import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  getDashboardStats,
  getWeeklySteps,
  getRecentActivity,
  getActiveChallenges,
} from '../controllers/dashboardController';

const router = Router();

router.use(requireAuth);

router.get('/stats', getDashboardStats);
router.get('/weekly-steps', getWeeklySteps);
router.get('/recent-activity', getRecentActivity);
router.get('/active-challenges', getActiveChallenges);

export default router;
