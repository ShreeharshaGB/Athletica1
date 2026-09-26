import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';
import {
  createClassroom,
  getTeacherClassrooms,
  joinClassroom,
  getStudentClassrooms,
} from '../controllers/classroomController.js';

const teacherRouter = Router();
teacherRouter.use(authenticate, requireRole('teacher'));
teacherRouter.post('/', createClassroom);
teacherRouter.get('/', getTeacherClassrooms);

const studentRouter = Router();
studentRouter.use(authenticate, requireRole('student', 'community'));
studentRouter.post('/join', joinClassroom);
studentRouter.get('/', getStudentClassrooms);

export { teacherRouter, studentRouter };