import { Router } from 'express';
import authRoutes from './authRoutes';
import goalRoutes from './goalRoutes';
import appRoutes from './appRoutes';
import thresholdRoutes from './thresholdRoutes';
import usageRoutes from './usageRoutes';
import storyRoutes from './storyRoutes';
import focusRoutes from './focusRoutes';
import preferenceRoutes from './preferenceRoutes';
import aiRoutes from './aiRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/goals', goalRoutes);
router.use('/apps', appRoutes);
router.use('/thresholds', thresholdRoutes);
router.use('/usage', usageRoutes);
router.use('/stories', storyRoutes);
router.use('/focus', focusRoutes);
router.use('/preferences', preferenceRoutes);
router.use('/ai', aiRoutes);

export default router;
