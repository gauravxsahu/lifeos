import { Router } from 'express';
import {
  syncUsage,
  getDailyUsage,
  getWeeklyUsage,
  getAppUsageHistory,
} from '../controllers/usageController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.post('/sync', syncUsage);
router.get('/daily', getDailyUsage);
router.get('/weekly', getWeeklyUsage);
router.get('/apps/:packageName', getAppUsageHistory);

export default router;
