import express from 'express';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';
import {
  getTeacherStudents,
  getTeacherStats,
  getStudentDetails,
  createTeacherActivity,
  getTeacherActivities,
} from '../controllers/teacherController.js';

const router = express.Router();

// Require both valid JWT authentication and teacher role
router.use(authenticate);
router.use(requireRole('teacher'));

router.get('/students', getTeacherStudents);
router.get('/stats', getTeacherStats);
router.get('/students/:id', getStudentDetails);

// Activities / Challenges
router.post('/activities', createTeacherActivity);
router.get('/activities', getTeacherActivities);

export default router;
