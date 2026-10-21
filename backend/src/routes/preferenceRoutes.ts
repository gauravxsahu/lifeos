import { Router } from 'express';
import {
  getPreferences,
  updatePreferences,
  updateLanguage,
  updateVoiceSettings,
  updateNotificationSettings,
  exportUserData,
  deleteUsageData,
  deleteAccount,
} from '../controllers/preferenceController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', getPreferences);
router.patch('/', updatePreferences);
router.patch('/language', updateLanguage);
router.patch('/voice', updateVoiceSettings);
router.patch('/notifications', updateNotificationSettings);

// Data Privacy
router.get('/privacy/export', exportUserData);
router.delete('/privacy/usage', deleteUsageData);
router.delete('/privacy/account', deleteAccount);

export default router;
