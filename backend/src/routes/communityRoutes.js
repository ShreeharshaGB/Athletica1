import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';
import {
  getCommunityProfile,
  getCommunityMembers,
  getCommunityChallenges,
  createCommunityChallenge,
  joinCommunityChallenge,
  getCommunityLeaderboard,
  getCommunityActivityFeed,
} from '../controllers/communityController.js';

const router = Router();

// Protect all community routes: authenticated community users only
router.use(authenticate, requireRole('community'));

router.get('/profile', getCommunityProfile);
router.get('/members', getCommunityMembers);
router.get('/challenges', getCommunityChallenges);
router.post('/challenges', createCommunityChallenge);
router.post('/challenges/:id/join', joinCommunityChallenge);
router.get('/leaderboard', getCommunityLeaderboard);
router.get('/activity-feed', getCommunityActivityFeed);

export default router;
export { router as communityRoutes };
