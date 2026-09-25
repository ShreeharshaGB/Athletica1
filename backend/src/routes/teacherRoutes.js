import express from 'express';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';
import {
  getTeacherStudents,
  getTeacherStats,
  getStudentDetails,
} from '../controllers/teacherController.js';

const router = express.Router();

// Require both valid JWT authentication and teacher role
router.use(authenticate);
router.use(requireRole('teacher'));

router.get('/students', getTeacherStudents);
router.get('/stats', getTeacherStats);
router.get('/students/:id', getStudentDetails);

export default router;
