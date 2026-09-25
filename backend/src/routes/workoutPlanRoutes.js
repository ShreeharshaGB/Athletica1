import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  createPlan,
  getActivePlan,
  getPlanHistory,
  updatePlan,
} from '../controllers/workoutPlanController.js';

const router = express.Router();

router.use(authenticate);

router.route('/')
  .post(createPlan)
  .get(getActivePlan);

router.get('/history', getPlanHistory);
router.put('/:planId', updatePlan);

export default router;
