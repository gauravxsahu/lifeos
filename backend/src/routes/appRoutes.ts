import { Router } from 'express';
import {
  getApps,
  createApp,
  updateApp,
  deleteApp,
  getAppThresholds,
  createThreshold,
} from '../controllers/appController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', getApps);
router.post('/', createApp);
router.patch('/:id', updateApp);
router.delete('/:id', deleteApp);

router.get('/:id/thresholds', getAppThresholds);
router.post('/:id/thresholds', createThreshold);

export default router;
