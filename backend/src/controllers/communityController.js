import User from '../models/User.js';
import Activity from '../models/Activity.js';
import ActivityParticipation from '../models/ActivityParticipation.js';

/**
 * Helper to ensure communityId is always available on req.user.
 */
async function resolveCommunityId(req) {
  if (req.user?.communityId) {
    return req.user.communityId;
  }
  const user = await User.findById(req.user.id).select('communityId').lean();
  if (user?.communityId) {
    req.user.communityId = user.communityId;
    return user.communityId;
  }
  return null;
}

/**
 * GET /api/community/profile
 * Returns metadata, stats, user points and rank within the community.
 */
export async function getCommunityProfile(req, res) {
  try {
    const communityId = await resolveCommunityId(req);
    if (!communityId) {
      return res.status(400).json({ message: 'User does not belong to any community.' });
    }

    // 1. Total members in this community
    const membersCount = await User.countDocuments({ communityId, role: 'community' });

    // 2. Active community challenges
    const now = new Date();
    const activeChallengesCount = await Activity.countDocuments({
      communityId,
      startDate: { $lte: now },
      endDate: { $gte: now },
    });

    // 3. User points from participations in this community
    const userParticipations = await ActivityParticipation.find({
      studentId: req.user.id,
      communityId,
    }).lean();

    const myPoints = userParticipations.reduce(
      (acc, p) => acc + (p.pointsAwarded || 0),
      0
    );

    // 4. Calculate rank on the community leaderboard
    // Aggregate points for all community members
    const allCommunityUsers = await User.find({ communityId, role: 'community' })
      .select('_id name')
      .lean();

    const memberIds = allCommunityUsers.map((u) => u._id);

    const pointsAggregation = await ActivityParticipation.aggregate([
      { $match: { studentId: { $in: memberIds }, communityId } },
      {
        $group: {
          _id: '$studentId',
          totalPoints: { $sum: '$pointsAwarded' },
        },
      },
      { $sort: { totalPoints: -1 } },
    ]);

    const pointsMap = new Map();
    pointsAggregation.forEach((row) => {
      pointsMap.set(String(row._id), row.totalPoints);
    });

    const rankedList = allCommunityUsers
      .map((u) => ({
        id: String(u._id),
        points: pointsMap.get(String(u._id)) || 0,
      }))
      .sort((a, b) => b.points - a.points);

    const userIndex = rankedList.findIndex((r) => r.id === String(req.user.id));
    const myRank = userIndex >= 0 ? userIndex + 1 : 1;

    // Format human-friendly community name from ID (e.g. MANGALORE-FITNESS -> Mangalore Fitness)
    const communityName = communityId
      .toLowerCase()
      .split(/[-_ ]+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    return res.status(200).json({
      communityId,
      communityName,
      membersCount: Math.max(1, membersCount),
      activeChallengesCount,
      myPoints,
      myRank,
    });
  } catch (error) {
    console.error('Error in getCommunityProfile:', error);
    return res.status(500).json({ message: 'Server error loading community profile.' });
  }
}

/**
 * GET /api/community/members
 * Returns members belonging to the authenticated user's community.
 */
export async function getCommunityMembers(req, res) {
  try {
    const communityId = await resolveCommunityId(req);
    if (!communityId) {
      return res.status(400).json({ message: 'User does not belong to any community.' });
    }

    const members = await User.find({ communityId, role: 'community' })
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .lean();

    // Attach points for each member
    const memberIds = members.map((m) => m._id);
    const participationTotals = await ActivityParticipation.aggregate([
      { $match: { studentId: { $in: memberIds }, communityId } },
      {
        $group: {
          _id: '$studentId',
          points: { $sum: '$pointsAwarded' },
          challengesJoined: { $sum: 1 },
        },
      },
    ]);

    const statsMap = new Map();
    participationTotals.forEach((row) => {
      statsMap.set(String(row._id), {
        points: row.points || 0,
        challengesJoined: row.challengesJoined || 0,
      });
    });

    const formattedMembers = members.map((m) => {
      const stats = statsMap.get(String(m._id)) || { points: 0, challengesJoined: 0 };
      return {
        id: m._id,
        name: m.name,
        email: m.email,
        role: m.role,
        points: stats.points,
        challengesJoined: stats.challengesJoined,
        joinedAt: m.createdAt,
      };
    });

    return res.status(200).json({
      communityId,
      members: formattedMembers,
      total: formattedMembers.length,
    });
  } catch (error) {
    console.error('Error in getCommunityMembers:', error);
    return res.status(500).json({ message: 'Server error loading community members.' });
  }
}

/**
 * GET /api/community/challenges
 * Returns all challenges belonging strictly to the authenticated user's communityId.
 */
export async function getCommunityChallenges(req, res) {
  try {
    const communityId = await resolveCommunityId(req);
    if (!communityId) {
      return res.status(400).json({ message: 'User does not belong to any community.' });
    }

    const activities = await Activity.find({ communityId })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name')
      .lean();

    // Check which challenges the current user has joined
    const activityIds = activities.map((a) => a._id);
    const userParticipations = await ActivityParticipation.find({
      activityId: { $in: activityIds },
      studentId: req.user.id,
    }).lean();

    const joinedSet = new Set(userParticipations.map((p) => String(p.activityId)));

    // Participant counts per activity
    const counts = await ActivityParticipation.aggregate([
      { $match: { activityId: { $in: activityIds } } },
      { $group: { _id: '$activityId', count: { $sum: 1 } } },
    ]);
    const countsMap = new Map();
    counts.forEach((c) => countsMap.set(String(c._id), c.count));

    const formattedChallenges = activities.map((a) => {
      const now = new Date();
      const start = new Date(a.startDate);
      const end = new Date(a.endDate);
      let status = 'Active';
      if (now < start) status = 'Upcoming';
      else if (now > end) status = 'Completed';

      return {
        id: a._id,
        title: a.title,
        description: a.description,
        type: a.type || 'challenge',
        communityId: a.communityId,
        startDate: a.startDate,
        endDate: a.endDate,
        points: a.points,
        status,
        creatorName: a.createdBy?.name || 'Community Leader',
        participantCount: countsMap.get(String(a._id)) || 0,
        isJoined: joinedSet.has(String(a._id)),
      };
    });

    return res.status(200).json({
      challenges: formattedChallenges,
      total: formattedChallenges.length,
    });
  } catch (error) {
    console.error('Error in getCommunityChallenges:', error);
    return res.status(500).json({ message: 'Server error loading community challenges.' });
  }
}

/**
 * POST /api/community/challenges
 * Creates a challenge for the authenticated user's community.
 */
export async function createCommunityChallenge(req, res) {
  try {
    const communityId = await resolveCommunityId(req);
    if (!communityId) {
      return res.status(400).json({ message: 'User does not belong to any community.' });
    }

    const { title, description, startDate, endDate, points } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Challenge title and description are required.' });
    }

    const parsedStart = startDate ? new Date(startDate) : new Date();
    const parsedEnd = endDate ? new Date(endDate) : new Date(Date.now() + 7 * 86400000);

    if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
      return res.status(400).json({ message: 'Valid start and end dates are required.' });
    }

    if (parsedEnd <= parsedStart) {
      return res.status(400).json({ message: 'End date must be after start date.' });
    }

    const activity = await Activity.create({
      title: title.trim(),
      description: description.trim(),
      type: 'challenge',
      communityId,
      institutionId: null,
      createdBy: req.user.id,
      startDate: parsedStart,
      endDate: parsedEnd,
      points: Math.max(10, Math.min(1000, Number(points) || 100)),
    });

    return res.status(201).json({
      message: 'Community challenge created successfully!',
      challenge: {
        id: activity._id,
        title: activity.title,
        description: activity.description,
        communityId: activity.communityId,
        startDate: activity.startDate,
        endDate: activity.endDate,
        points: activity.points,
        status: 'Active',
        participantCount: 0,
        isJoined: false,
      },
    });
  } catch (error) {
    console.error('Error in createCommunityChallenge:', error);
    return res.status(500).json({ message: 'Server error creating community challenge.' });
  }
}

/**
 * POST /api/community/challenges/:id/join
 * Joins a community challenge. Enforces that the challenge belongs to the user's community.
 */
export async function joinCommunityChallenge(req, res) {
  try {
    const communityId = await resolveCommunityId(req);
    if (!communityId) {
      return res.status(400).json({ message: 'User does not belong to any community.' });
    }

    const { id } = req.params;

    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ message: 'Challenge not found.' });
    }

    // Authorization check: activity MUST belong to the user's communityId
    if (activity.communityId !== communityId) {
      return res.status(403).json({
        message: 'Forbidden: You cannot join a challenge outside your registered community.',
      });
    }

    // Check for duplicate participation
    const existing = await ActivityParticipation.findOne({
      activityId: activity._id,
      studentId: req.user.id,
    });

    if (existing) {
      return res.status(409).json({ message: 'You have already joined this challenge.' });
    }

    const participation = await ActivityParticipation.create({
      activityId: activity._id,
      studentId: req.user.id,
      communityId,
      institutionId: null,
      pointsAwarded: activity.points || 50,
      status: 'joined',
      joinedAt: new Date(),
    });

    return res.status(201).json({
      message: `Successfully joined ${activity.title}! +${activity.points} community points awarded.`,
      participation: {
        id: participation._id,
        activityId: participation.activityId,
        joinedAt: participation.joinedAt,
        pointsAwarded: participation.pointsAwarded,
      },
    });
  } catch (error) {
    console.error('Error in joinCommunityChallenge:', error);
    return res.status(500).json({ message: 'Server error while joining challenge.' });
  }
}

/**
 * GET /api/community/leaderboard
 * Returns leaderboard ranked strictly within the authenticated user's communityId.
 */
export async function getCommunityLeaderboard(req, res) {
  try {
    const communityId = await resolveCommunityId(req);
    if (!communityId) {
      return res.status(400).json({ message: 'User does not belong to any community.' });
    }

    // Fetch members of this community
    const members = await User.find({ communityId, role: 'community' })
      .select('name email')
      .lean();

    const memberIds = members.map((m) => m._id);

    // Aggregate points and challenges joined for community members
    const participationTotals = await ActivityParticipation.aggregate([
      { $match: { studentId: { $in: memberIds }, communityId } },
      {
        $group: {
          _id: '$studentId',
          totalPoints: { $sum: '$pointsAwarded' },
          challengesJoined: { $sum: 1 },
        },
      },
      { $sort: { totalPoints: -1 } },
    ]);

    const statsMap = new Map();
    participationTotals.forEach((row) => {
      statsMap.set(String(row._id), {
        totalPoints: row.totalPoints || 0,
        challengesJoined: row.challengesJoined || 0,
      });
    });

    // Build sorted leaderboard
    const leaderboard = members
      .map((m) => {
        const stats = statsMap.get(String(m._id)) || { totalPoints: 0, challengesJoined: 0 };
        return {
          id: String(m._id),
          name: m.name,
          points: stats.totalPoints,
          challengesJoined: stats.challengesJoined,
          isCurrentUser: String(m._id) === String(req.user.id),
        };
      })
      .sort((a, b) => b.points - a.points)
      .map((entry, idx) => ({
        rank: idx + 1,
        ...entry,
      }));

    return res.status(200).json({
      communityId,
      leaderboard,
    });
  } catch (error) {
    console.error('Error in getCommunityLeaderboard:', error);
    return res.status(500).json({ message: 'Server error loading leaderboard.' });
  }
}

/**
 * GET /api/community/activity-feed
 * Returns recent activity events strictly from the user's community.
 */
export async function getCommunityActivityFeed(req, res) {
  try {
    const communityId = await resolveCommunityId(req);
    if (!communityId) {
      return res.status(400).json({ message: 'User does not belong to any community.' });
    }

    // 1. Recent challenge joins
    const recentJoins = await ActivityParticipation.find({ communityId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('studentId', 'name')
      .populate('activityId', 'title points')
      .lean();

    // 2. Recent challenges created
    const recentChallenges = await Activity.find({ communityId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'name')
      .lean();

    const events = [];

    recentJoins.forEach((p) => {
      if (p.studentId && p.activityId) {
        events.push({
          id: `join-${p._id}`,
          type: 'join',
          text: `${p.studentId.name} joined the "${p.activityId.title}" challenge (+${p.pointsAwarded || 0} pts)`,
          time: p.createdAt || p.joinedAt,
        });
      }
    });

    recentChallenges.forEach((c) => {
      events.push({
        id: `create-${c._id}`,
        type: 'challenge',
        text: `New challenge created: "${c.title}" (${c.points} points)`,
        time: c.createdAt,
      });
    });

    events.sort((a, b) => new Date(b.time) - new Date(a.time));

    return res.status(200).json({
      communityId,
      feed: events.slice(0, 15),
    });
  } catch (error) {
    console.error('Error in getCommunityActivityFeed:', error);
    return res.status(500).json({ message: 'Server error loading activity feed.' });
  }
}
