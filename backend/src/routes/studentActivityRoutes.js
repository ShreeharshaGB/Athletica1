import express from 'express';
import {
  getStudentActivities,
  joinActivity,
  completeActivity,
  getJoinedActivities,
} from '../controllers/studentActivityController.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);
router.use(requireRole('student'));

router.get('/joined', getJoinedActivities);
router.get('/', getStudentActivities);
router.post('/:activityId/join', joinActivity);
router.post('/:activityId/complete', completeActivity);

export default router;
export { router as studentActivityRoutes };
