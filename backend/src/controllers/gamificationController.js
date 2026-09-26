import User from '../models/User.js';
import ActivityParticipation from '../models/ActivityParticipation.js';

/**
 * GET /api/gamification/leaderboard
 * Returns an authoritative leaderboard scoped by the authenticated user's institution or community.
 */
export async function getLeaderboard(req, res) {
  try {
    const userId = req.user.id;
    const currentUser = await User.findById(userId).select('name email role institutionId communityId').lean();

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let filter = {};
    if (currentUser.role === 'community') {
      const communityId = currentUser.communityId || req.user.communityId;
      filter = { communityId, role: 'community' };
    } else {
      // Student or Teacher: scope to students in their institution
      const institutionId = currentUser.institutionId || req.user.institutionId;
      if (institutionId) {
        filter = { institutionId, role: 'student' };
      } else {
        filter = { role: 'student' };
      }
    }

    // Retrieve scoped users
    const users = await User.find(filter).select('name role institutionId communityId').lean();
    const userIds = users.map((u) => u._id);

    // Aggregate points & completed activities from ActivityParticipation
    const participationTotals = await ActivityParticipation.aggregate([
      { $match: { studentId: { $in: userIds } } },
      {
        $group: {
          _id: '$studentId',
          totalPoints: { $sum: '$pointsAwarded' },
          completedCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
            },
          },
          joinedCount: { $sum: 1 },
        },
      },
    ]);

    const statsMap = new Map();
    participationTotals.forEach((row) => {
      statsMap.set(String(row._id), {
        points: row.totalPoints || 0,
        completed: row.completedCount || 0,
        joined: row.joinedCount || 0,
      });
    });

    const BASE_XP = 1250;

    // Build ranked list
    const rankedList = users.map((u) => {
      const stats = statsMap.get(String(u._id)) || { points: 0, completed: 0, joined: 0 };
      const totalXP = BASE_XP + stats.points;
      const level = Math.max(1, Math.floor(totalXP / 500) + 1);

      return {
        id: u._id,
        name: u.name,
        xp: totalXP,
        activityPoints: stats.points,
        completedChallenges: stats.completed,
        challengesJoined: stats.joined,
        level,
        streak: 3, // default activity streak
        isCurrentUser: String(u._id) === String(currentUser._id),
      };
    });

    // Sort by XP descending, then completed count descending
    rankedList.sort((a, b) => b.xp - a.xp || b.completedChallenges - a.completedChallenges);

    // Assign badges & ranks
    const finalLeaderboard = rankedList.map((entry, index) => {
      const rank = index + 1;
      let badge = `Level ${entry.level}`;
      if (rank === 1) badge = '🏆 Gold';
      else if (rank === 2) badge = '🥈 Silver';
      else if (rank === 3) badge = '🥉 Bronze';

      return {
        ...entry,
        rank,
        badge,
      };
    });

    // Locate current user
    const userEntry = finalLeaderboard.find((e) => e.isCurrentUser) || {
      rank: finalLeaderboard.length + 1,
      id: currentUser._id,
      name: currentUser.name,
      xp: BASE_XP,
      level: 3,
      streak: 3,
      completedChallenges: 0,
      challengesJoined: 0,
      badge: 'Level 3',
      isCurrentUser: true,
    };

    return res.status(200).json({
      leaderboard: finalLeaderboard,
      currentUser: userEntry,
      scope: currentUser.role === 'community' ? currentUser.communityId : (currentUser.institutionId || 'General'),
      totalAthletes: finalLeaderboard.length,
    });
  } catch (error) {
    console.error('Error fetching gamification leaderboard:', error);
    return res.status(500).json({ message: 'Server error loading leaderboard.' });
  }
}
