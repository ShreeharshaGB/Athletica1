import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  createAssessment,
  getLatestAssessment,
  getAssessmentHistory,
  updateAssessment,
} from '../controllers/fitnessAssessmentController.js';

const router = express.Router();

router.use(authenticate);

router.route('/')
  .post(createAssessment)
  .get(getLatestAssessment);

router.get('/history', getAssessmentHistory);
router.put('/:assessmentId', updateAssessment);

export default router;
