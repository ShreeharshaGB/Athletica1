import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';
import { uploadSingleImage } from '../middleware/uploadMiddleware.js';
import {
  analyzeFood,
  describeFood,
  logCuratedMeal,
  getRecentMeals,
  getTodayNutrition,
  getMealImage,
} from '../controllers/nutritionController.js';

const router = Router();

// Protect all nutrition endpoints: authenticated student only
router.use(authenticate, requireRole('student'));

router.post('/analyze', uploadSingleImage('image'), analyzeFood);
router.post('/describe', describeFood);
router.post('/log-curated', logCuratedMeal);
router.get('/meals', getRecentMeals);
router.get('/today', getTodayNutrition);
router.get('/image/:id', getMealImage);

export default router;
export { router as nutritionRoutes };

