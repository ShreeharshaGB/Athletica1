import express from 'express';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';
import {
  getStudentActivities,
  joinActivity,
  getJoinedActivities,
} from '../controllers/studentActivityController.js';

const router = express.Router();

router.use(authenticate);
router.use(requireRole('student'));

router.get('/', getStudentActivities);
router.post('/:activityId/join', joinActivity);
router.get('/joined', getJoinedActivities);

export default router;
export { router as studentActivityRoutes };
