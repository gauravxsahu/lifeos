import { Router } from 'express';
import {
  startFocusSession,
  getFocusSessions,
  updateFocusSession,
} from '../controllers/focusController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.post('/sessions', startFocusSession);
router.get('/sessions', getFocusSessions);
router.patch('/sessions/:id', updateFocusSession);

export default router;
