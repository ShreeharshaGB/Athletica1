import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';
import {
  createClassroom,
  getTeacherClassrooms,
  joinClassroom,
  getStudentClassrooms,
  getClassroomDetails,
  createClassroomTask,
  completeClassroomTask,
} from '../controllers/classroomController.js';

const teacherRouter = Router();
teacherRouter.use(authenticate, requireRole('teacher'));
teacherRouter.post('/', createClassroom);
teacherRouter.get('/', getTeacherClassrooms);
teacherRouter.get('/:id', getClassroomDetails);
teacherRouter.post('/:id/tasks', createClassroomTask);

const studentRouter = Router();
studentRouter.use(authenticate, requireRole('student', 'community'));
studentRouter.post('/join', joinClassroom);
studentRouter.get('/', getStudentClassrooms);
studentRouter.get('/:id', getClassroomDetails);
studentRouter.post('/:id/tasks/:taskId/complete', completeClassroomTask);

export { teacherRouter, studentRouter };