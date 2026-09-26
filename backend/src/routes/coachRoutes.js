import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';
import { chatWithCoach } from '../controllers/coachController.js';

const router = Router();

router.use(authenticate, requireRole('student', 'community'));
router.post('/chat', chatWithCoach);

export default router;