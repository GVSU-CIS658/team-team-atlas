import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getMe, updateMe, getMyStatistics } from '../controllers/userController';

const router = Router();

router.use(requireAuth);

router.get('/me', getMe);
router.patch('/me', updateMe);
router.get('/me/statistics', getMyStatistics);

export default router;
