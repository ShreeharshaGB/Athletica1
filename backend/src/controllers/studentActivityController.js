import User from '../models/User.js';
import Activity from '../models/Activity.js';
import ActivityParticipation from '../models/ActivityParticipation.js';

/**
 * GET /api/student/activities
 * Returns all activities for the student's institution with join status & participant count
 */
export const getStudentActivities = async (req, res) => {
  try {
    const student = await User.findById(req.user.id).select('institutionId role name');
    if (!student || student.role !== 'student') {
      return res.status(403).json({ message: 'Student access required' });
    }

    const institutionId = student.institutionId;
    if (!institutionId) {
      return res.status(200).json({
        activities: [],
        totalPoints: 0,
        message: 'No institution assigned to student',
      });
    }

    // Find activities belonging strictly to the student's institution
    const activities = await Activity.find({ institutionId })
      .sort({ createdAt: -1 })
      .lean();

    const activityIds = activities.map((a) => a._id);

    // Fetch this student's participations
    const myParticipations = await ActivityParticipation.find({
      studentId: student._id,
    }).lean();

    const joinedSet = new Set(myParticipations.map((p) => p.activityId.toString()));
    const totalPoints = myParticipations.reduce((sum, p) => sum + (p.pointsAwarded || 0), 0);

    // Fetch participant counts for each activity
    const counts = await ActivityParticipation.aggregate([
      { $match: { activityId: { $in: activityIds } } },
      { $group: { _id: '$activityId', count: { $sum: 1 } } },
    ]);

    const countMap = new Map();
    for (const c of counts) {
      countMap.set(c._id.toString(), c.count);
    }

    const now = new Date();
    const formattedActivities = activities.map((act) => {
      const start = new Date(act.startDate);
      const end = new Date(act.endDate);
      let status = 'Active';
      if (now < start) status = 'Upcoming';
      else if (now > end) status = 'Completed';

      return {
        id: act._id,
        title: act.title,
        description: act.description,
        type: act.type,
        institutionId: act.institutionId,
        startDate: act.startDate,
        endDate: act.endDate,
        points: act.points,
        status,
        hasJoined: joinedSet.has(act._id.toString()),
        participantCount: countMap.get(act._id.toString()) || 0,
        createdAt: act.createdAt,
      };
    });

    return res.status(200).json({
      activities: formattedActivities,
      totalPoints,
    });
  } catch (error) {
    console.error('Error fetching student activities:', error);
    return res.status(500).json({
      message: 'Server error while fetching activities',
    });
  }
};

/**
 * POST /api/student/activities/:activityId/join
 * Student joins an activity hosted by their institution
 */
export const joinActivity = async (req, res) => {
  try {
    const student = await User.findById(req.user.id).select('institutionId role');
    if (!student || student.role !== 'student') {
      return res.status(403).json({ message: 'Student access required' });
    }

    const { activityId } = req.params;
    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Institution isolation check
    if (!student.institutionId || activity.institutionId !== student.institutionId) {
      return res.status(403).json({
        message: 'You can only join activities hosted by your own institution',
      });
    }

    // Prevent duplicate join
    const existing = await ActivityParticipation.findOne({
      activityId: activity._id,
      studentId: student._id,
    });

    if (existing) {
      return res.status(400).json({
        message: 'You have already joined this activity',
      });
    }

    const participation = await ActivityParticipation.create({
      activityId: activity._id,
      studentId: student._id,
      institutionId: student.institutionId,
      joinedAt: new Date(),
      status: 'joined',
      pointsAwarded: activity.points || 0,
    });

    return res.status(201).json({
      message: 'Successfully joined activity',
      participation: {
        id: participation._id,
        activityId: participation.activityId,
        status: participation.status,
        pointsAwarded: participation.pointsAwarded,
        joinedAt: participation.joinedAt,
      },
    });
  } catch (error) {
    // Handle race condition with duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'You have already joined this activity',
      });
    }
    console.error('Error joining activity:', error);
    return res.status(500).json({
      message: 'Server error while joining activity',
    });
  }
};

/**
 * POST /api/student/activities/:activityId/complete
 * Marks a joined activity as completed and ensures XP/points are awarded once.
 */
export const completeActivity = async (req, res) => {
  try {
    const student = await User.findById(req.user.id).select('institutionId role');
    if (!student || student.role !== 'student') {
      return res.status(403).json({ message: 'Student access required' });
    }

    const { activityId } = req.params;
    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    let participation = await ActivityParticipation.findOne({
      activityId: activity._id,
      studentId: student._id,
    });

    if (!participation) {
      return res.status(400).json({ message: 'Please join the challenge before completing it.' });
    }

    if (participation.status === 'completed') {
      return res.status(200).json({
        message: 'You have already completed this activity. XP was previously awarded.',
        alreadyCompleted: true,
        pointsAwarded: participation.pointsAwarded,
      });
    }

    participation.status = 'completed';
    participation.completedAt = new Date();
    if (!participation.pointsAwarded || participation.pointsAwarded === 0) {
      participation.pointsAwarded = activity.points || 50;
    }
    await participation.save();

    return res.status(200).json({
      message: `Challenge completed! +${participation.pointsAwarded} XP awarded.`,
      pointsAwarded: participation.pointsAwarded,
      status: 'completed',
    });
  } catch (error) {
    console.error('Error completing activity:', error);
    return res.status(500).json({ message: 'Server error while completing activity' });
  }
};

/**
 * GET /api/student/activities/joined
 * Returns list of activities the authenticated student has joined
 */
export const getJoinedActivities = async (req, res) => {
  try {
    const participations = await ActivityParticipation.find({
      studentId: req.user.id,
    })
      .populate('activityId')
      .sort({ joinedAt: -1 })
      .lean();

    const now = new Date();
    const joined = participations
      .filter((p) => p.activityId) // Filter out deleted activities if any
      .map((p) => {
        const act = p.activityId;
        const start = new Date(act.startDate);
        const end = new Date(act.endDate);
        let status = 'Active';
        if (now < start) status = 'Upcoming';
        else if (now > end) status = 'Completed';

        return {
          id: p._id,
          participationId: p._id,
          activityId: act._id,
          title: act.title,
          description: act.description,
          type: act.type,
          points: act.points,
          pointsAwarded: p.pointsAwarded,
          joinedAt: p.joinedAt,
          startDate: act.startDate,
          endDate: act.endDate,
          status: p.status || status,
          activity: {
            id: act._id,
            title: act.title,
            description: act.description,
            type: act.type,
            points: act.points,
            startDate: act.startDate,
            endDate: act.endDate,
            institutionId: act.institutionId,
            status,
          },
        };
      });

    return res.status(200).json({
      joinedActivities: joined,
      participations: joined,
    });
  } catch (error) {
    console.error('Error fetching joined activities:', error);
    return res.status(500).json({
      message: 'Server error while fetching joined activities',
    });
  }
};
