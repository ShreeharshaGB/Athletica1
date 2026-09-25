import express from 'express';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';
import {
  createPlan,
  getActivePlan,
  generateOrUpdatePlan,
  toggleActivityCompletion,
  getPlanHistory,
  updatePlan,
} from '../controllers/workoutPlanController.js';

const router = express.Router();

router.use(authenticate);
router.use(requireRole('student', 'community'));

router.route('/')
  .post(createPlan)
  .get(getActivePlan);

router.post('/generate', generateOrUpdatePlan);
router.post('/activity/toggle', toggleActivityCompletion);
router.post('/toggle-activity', toggleActivityCompletion);

router.get('/history', getPlanHistory);
router.put('/:planId', updatePlan);

export default router;
