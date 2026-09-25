import express from 'express';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';
import {
  getTeacherStudents,
  getTeacherStats,
  getStudentDetails,
  createTeacherActivity,
  getTeacherActivities,
  getTalentDiscovery,
  getStudentInsights,
} from '../controllers/teacherController.js';

const router = express.Router();

// Require both valid JWT authentication and teacher role
router.use(authenticate);
router.use(requireRole('teacher'));

router.get('/students', getTeacherStudents);
router.get('/stats', getTeacherStats);
router.get('/students/:id', getStudentDetails);

// Talent Discovery & Student Insights
router.get('/talent-discovery', getTalentDiscovery);
router.get('/student-insights', getStudentInsights);

// Activities / Challenges
router.post('/activities', createTeacherActivity);
router.get('/activities', getTeacherActivities);

export default router;
