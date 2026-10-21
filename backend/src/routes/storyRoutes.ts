import { Router } from 'express';
import {
  getStories,
  getStoryById,
  saveStory,
  getSavedStories,
  recommendStory,
} from '../controllers/storyController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', getStories);
router.get('/saved', getSavedStories);
router.post('/recommend', recommendStory);
router.get('/:id', getStoryById);
router.post('/:id/save', saveStory);

export default router;
