import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';
import { createDietPlan, getDietPlans, getActiveDietPlan } from '../controllers/dietPlanController.js';

const router = Router();
router.use(authenticate, requireRole('student', 'community'));
router.post('/', createDietPlan);
router.get('/', getDietPlans);
router.get('/active', getActiveDietPlan);

export default router;