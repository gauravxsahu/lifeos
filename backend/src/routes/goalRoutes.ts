import { Router } from 'express';
import {
  getGoals,
  createGoal,
  getGoalById,
  updateGoal,
  deleteGoal,
  completeGoal,
  getCompletions,
} from '../controllers/goalController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', getGoals);
router.post('/', createGoal);
router.get('/:id', getGoalById);
router.patch('/:id', updateGoal);
router.delete('/:id', deleteGoal);

router.post('/:id/completions', completeGoal);
router.get('/:id/completions', getCompletions);

export default router;
