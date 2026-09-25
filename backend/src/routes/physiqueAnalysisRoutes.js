import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';
import { uploadSingleImage } from '../middleware/uploadMiddleware.js';
import {
  analyzePhysique,
  getLatestAnalysis,
  getAnalysisImage,
} from '../controllers/physiqueAnalysisController.js';

const router = Router();

// Protect all routes: must be authenticated student or community member
router.use(authenticate, requireRole('student', 'community'));

router.get('/', getLatestAnalysis);
router.post('/', uploadSingleImage('image'), analyzePhysique);
router.get('/image/:id', getAnalysisImage);

export default router;
export { router as physiqueAnalysisRoutes };
