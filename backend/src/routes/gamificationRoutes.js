import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { getLeaderboard } from '../controllers/gamificationController.js';

const router = express.Router();

router.use(authenticate);
router.get('/leaderboard', getLeaderboard);

export default router;
export { router as gamificationRoutes };
