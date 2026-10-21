import { Router } from 'express';
import {
  generateReminder,
  personalizeStory,
  suggestGoalRescue,
} from '../controllers/aiController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.post('/reminder', generateReminder);
router.post('/story-personalization', personalizeStory);
router.post('/goal-suggestion', suggestGoalRescue);

export default router;
