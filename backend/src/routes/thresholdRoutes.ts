import { Router } from 'express';
import { updateThreshold, deleteThreshold } from '../controllers/appController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.patch('/:id', updateThreshold);
router.delete('/:id', deleteThreshold);

export default router;
