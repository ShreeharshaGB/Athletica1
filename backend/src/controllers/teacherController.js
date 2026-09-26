import User from '../models/User.js';
import FitnessAssessment from '../models/FitnessAssessment.js';
import StudentProfile from '../models/StudentProfile.js';
import Activity from '../models/Activity.js';
import ActivityParticipation from '../models/ActivityParticipation.js';
import PhysiqueAnalysis from '../models/PhysiqueAnalysis.js';
import WorkoutPlan from '../models/WorkoutPlan.js';
import AnalyzedMeal from '../models/AnalyzedMeal.js';
import DietPlan from '../models/DietPlan.js';

/**
 * Helper to fetch and validate the authenticated teacher and their institutionId
 */
async function getAuthenticatedTeacher(userId) {
  const teacher = await User.findById(userId).select('name email role institutionId');
  if (!teacher || teacher.role !== 'teacher') {
    const error = new Error('Teacher access required');
    error.statusCode = 403;
    throw error;
  }
  return teacher;
}

/**
 * GET /api/teacher/students
 * Fetches all students belonging to the authenticated teacher's institution
 */
export const getTeacherStudents = async (req, res) => {
  try {
    const teacher = await getAuthenticatedTeacher(req.user.id);
    const institutionId = teacher.institutionId;

    if (!institutionId) {
      return res.status(200).json({
        students: [],
        institutionId: null,
        message: 'No institution assigned to this teacher account'
      });
    }

    // Query ONLY students belonging to the teacher's institution
    const students = await User.find({
      role: 'student',
      institutionId: institutionId
    })
      .select('_id name email role institutionId createdAt')
      .sort({ name: 1 })
      .lean();

    const studentIds = students.map((s) => s._id);

    // Retrieve all assessments for these students sorted by date descending
    const assessments = await FitnessAssessment.find({
      userId: { $in: studentIds }
    })
      .sort({ assessmentDate: -1, createdAt: -1 })
      .lean();

    // Map each student's latest assessment
    const latestAssessmentsByStudentId = new Map();
    for (const assessment of assessments) {
      const studentIdStr = assessment.userId.toString();
      if (!latestAssessmentsByStudentId.has(studentIdStr)) {
        latestAssessmentsByStudentId.set(studentIdStr, assessment);
      }
    }

    // Retrieve student profiles
    const profiles = await StudentProfile.find({
      userId: { $in: studentIds }
    }).lean();

    const profilesByStudentId = new Map();
    for (const profile of profiles) {
      profilesByStudentId.set(profile.userId.toString(), profile);
    }

    // Retrieve participations for these students
    const participations = await ActivityParticipation.find({
      studentId: { $in: studentIds }
    }).populate('activityId', 'title type points').lean();

    const participationsByStudentId = new Map();
    for (const part of participations) {
      const studentIdStr = part.studentId.toString();
      if (!participationsByStudentId.has(studentIdStr)) {
        participationsByStudentId.set(studentIdStr, []);
      }
      participationsByStudentId.get(studentIdStr).push(part);
    }

    // Check physique analysis presence (privacy-respecting flag only)
    const physiqueAnalyses = await PhysiqueAnalysis.find({
      userId: { $in: studentIds }
    }).select('userId createdAt').lean();

    const physiqueUserIds = new Set(physiqueAnalyses.map((p) => p.userId.toString()));

    // Assemble unified student objects
    const enrichedStudents = students.map((student) => {
      const studentIdStr = student._id.toString();
      const latestAssessment = latestAssessmentsByStudentId.get(studentIdStr) || null;
      const profile = profilesByStudentId.get(studentIdStr) || null;
      const studentParts = participationsByStudentId.get(studentIdStr) || [];
      const activitiesCount = studentParts.length;
      const pointsEarned = studentParts.reduce((sum, p) => sum + (p.pointsAwarded || 0), 0);

      // Activity status: Active if assessment logged or joined challenges
      const activityStatus = (latestAssessment || activitiesCount > 0) ? 'Active' : 'Inactive';

      // Needs attention logic (engagement / admin indicator only)
      let needsAttention = false;
      let attentionReason = '';
      if (!latestAssessment && !profile) {
        needsAttention = true;
        attentionReason = 'Assessment pending & profile incomplete';
      } else if (!latestAssessment) {
        needsAttention = true;
        attentionReason = 'Assessment not completed';
      } else if (!profile) {
        needsAttention = true;
        attentionReason = 'Profile incomplete';
      } else if (activitiesCount === 0) {
        needsAttention = true;
        attentionReason = 'No recent activity';
      }

      // Calculate BMI if height and weight exist
      const bmi = (profile?.height && profile?.weight)
        ? Math.round((profile.weight / Math.pow(profile.height / 100, 2)) * 10) / 10
        : null;

      // Last activity date
      const dates = [
        student.createdAt,
        latestAssessment?.assessmentDate,
        studentParts[0]?.joinedAt
      ].filter(Boolean);
      const lastActivityDate = dates.length > 0 ? new Date(Math.max(...dates.map(d => new Date(d).getTime()))) : student.createdAt;

      // Clean formatted Student ID (e.g. ATH-8F3A21)
      const studentId = student.studentId || `ATH-${student._id.toString().slice(-6).toUpperCase()}`;

      return {
        id: student._id,
        studentId: studentId,
        name: student.name,
        email: student.email,
        institutionId: student.institutionId,
        createdAt: student.createdAt,
        lastActivityDate: lastActivityDate,
        assessmentStatus: latestAssessment ? 'Completed' : 'Pending',
        fitnessScore: latestAssessment?.overallScore ?? null,
        fitnessLevel: latestAssessment?.fitnessLevel ?? null,
        profileStatus: profile ? 'Complete' : 'Incomplete',
        activityStatus: activityStatus,
        activitiesCount: activitiesCount,
        pointsEarned: pointsEarned,
        needsAttention: needsAttention,
        attentionReason: attentionReason,
        bmi: bmi,
        hasPhysiqueAnalysis: physiqueUserIds.has(studentIdStr),
        physiqueStatus: physiqueUserIds.has(studentIdStr) ? 'Physique analysis completed' : 'Not completed',
        profile: profile
          ? {
              age: profile.age,
              gender: profile.gender,
              height: profile.height,
              weight: profile.weight,
              location: profile.location || '',
              fitnessGoal: profile.fitnessGoal,
              activityLevel: profile.activityLevel,
              dietPreference: profile.dietPreference
            }
          : null,
        latestAssessment: latestAssessment
          ? {
              id: latestAssessment._id,
              assessmentDate: latestAssessment.assessmentDate,
              pushUps: latestAssessment.pushUps,
              sitUps: latestAssessment.sitUps,
              runTime: latestAssessment.runTime,
              flexibility: latestAssessment.flexibility,
              shuttleRun: latestAssessment.shuttleRun,
              overallScore: latestAssessment.overallScore,
              fitnessLevel: latestAssessment.fitnessLevel
            }
          : null
      };
    });

    // Recent Student Activity
    const recentAssessments = assessments.slice(0, 5).map(a => {
      const st = students.find(s => s._id.toString() === a.userId.toString());
      return {
        id: `assess-${a._id}`,
        type: 'assessment',
        title: 'Completed physical baseline fitness assessment',
        studentName: st?.name || 'Student',
        score: a.overallScore,
        date: a.assessmentDate || a.createdAt
      };
    });

    const recentJoins = await ActivityParticipation.find({ institutionId })
      .populate('studentId', 'name')
      .populate('activityId', 'title type points')
      .sort({ joinedAt: -1 })
      .limit(5)
      .lean();

    const formattedJoins = recentJoins.map(j => ({
      id: `join-${j._id}`,
      type: 'activity_join',
      title: `Joined ${j.activityId?.title || 'Challenge'}`,
      studentName: j.studentId?.name || 'Student',
      points: j.pointsAwarded || j.activityId?.points || 0,
      date: j.joinedAt
    }));

    const recentActivities = [...recentAssessments, ...formattedJoins]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);

    return res.status(200).json({
      students: enrichedStudents,
      institutionId: institutionId,
      total: enrichedStudents.length,
      recentActivities: recentActivities
    });
  } catch (error) {
    console.error('Error fetching teacher students:', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      message: error.message || 'Server error while fetching students'
    });
  }
};

/**
 * GET /api/teacher/stats
 * Computes cohort statistics for the authenticated teacher's institution
 */
export const getTeacherStats = async (req, res) => {
  try {
    const teacher = await getAuthenticatedTeacher(req.user.id);
    const institutionId = teacher.institutionId;

    if (!institutionId) {
      return res.status(200).json({
        totalStudents: 0,
        assessmentsCompleted: 0,
        assessmentsPending: 0,
        activeStudents: 0,
        needsAttention: 0,
        averageFitnessScore: null,
        institutionId: null
      });
    }

    // Find all students in this institution
    const students = await User.find({
      role: 'student',
      institutionId: institutionId
    })
      .select('_id')
      .lean();

    const totalStudents = students.length;
    if (totalStudents === 0) {
      return res.status(200).json({
        totalStudents: 0,
        assessmentsCompleted: 0,
        assessmentsPending: 0,
        activeStudents: 0,
        needsAttention: 0,
        averageFitnessScore: null,
        institutionId: institutionId
      });
    }

    const studentIds = students.map((s) => s._id);

    // Find latest assessment for each student
    const assessments = await FitnessAssessment.find({
      userId: { $in: studentIds }
    })
      .sort({ assessmentDate: -1, createdAt: -1 })
      .lean();

    const latestScoresByStudent = new Map();
    for (const assessment of assessments) {
      const studentIdStr = assessment.userId.toString();
      if (!latestScoresByStudent.has(studentIdStr)) {
        latestScoresByStudent.set(studentIdStr, assessment.overallScore);
      }
    }

    const assessmentsCompleted = latestScoresByStudent.size;
    const assessmentsPending = Math.max(0, totalStudents - assessmentsCompleted);

    let averageFitnessScore = null;
    if (assessmentsCompleted > 0) {
      let totalScore = 0;
      let scoredCount = 0;
      for (const score of latestScoresByStudent.values()) {
        if (typeof score === 'number' && !isNaN(score)) {
          totalScore += score;
          scoredCount += 1;
        }
      }
      if (scoredCount > 0) {
        averageFitnessScore = Math.round((totalScore / scoredCount) * 10) / 10;
      }
    }

    // Active students: logged assessment OR joined an activity
    const participatedStudentIds = await ActivityParticipation.find({
      studentId: { $in: studentIds }
    }).distinct('studentId');

    const activeSet = new Set([
      ...latestScoresByStudent.keys(),
      ...participatedStudentIds.map(id => id.toString())
    ]);
    const activeStudents = activeSet.size;

    // Profiles completed
    const profiles = await StudentProfile.find({
      userId: { $in: studentIds }
    }).select('userId').lean();
    const profileSet = new Set(profiles.map(p => p.userId.toString()));

    // Students needing attention: assessment pending OR profile incomplete
    let needsAttention = 0;
    for (const sid of studentIds) {
      const sidStr = sid.toString();
      if (!latestScoresByStudent.has(sidStr) || !profileSet.has(sidStr)) {
        needsAttention += 1;
      }
    }

    return res.status(200).json({
      totalStudents,
      assessmentsCompleted,
      assessmentsPending,
      activeStudents,
      needsAttention,
      averageFitnessScore,
      institutionId: institutionId
    });
  } catch (error) {
    console.error('Error fetching teacher stats:', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      message: error.message || 'Server error while calculating teacher statistics'
    });
  }
};

/**
 * GET /api/teacher/students/:id
 * Fetches detailed info for a single student belonging to the teacher's institution
 */
export const getStudentDetails = async (req, res) => {
  try {
    const teacher = await getAuthenticatedTeacher(req.user.id);
    const institutionId = teacher.institutionId;

    if (!institutionId) {
      return res.status(403).json({
        message: 'Teacher has no assigned institution'
      });
    }

    const studentId = req.params.id;
    const student = await User.findOne({
      _id: studentId,
      role: 'student',
      institutionId: institutionId
    }).select('_id name email role institutionId createdAt').lean();

    if (!student) {
      return res.status(404).json({
        message: 'Student not found in your institution'
      });
    }

    const [profile, assessments, participations, physiqueDoc, workoutPlanDoc, meals, dietPlanDoc] = await Promise.all([
      StudentProfile.findOne({ userId: student._id }).lean(),
      FitnessAssessment.find({ userId: student._id }).sort({ assessmentDate: -1, createdAt: -1 }).lean(),
      ActivityParticipation.find({ studentId: student._id })
        .populate('activityId', 'title type points startDate endDate status')
        .sort({ joinedAt: -1 })
        .lean(),
      PhysiqueAnalysis.findOne({ userId: student._id }).select('createdAt').lean(),
      WorkoutPlan.findOne({ userId: student._id }).sort({ createdAt: -1 }).lean(),
      AnalyzedMeal.find({ userId: student._id }).sort({ createdAt: -1 }).limit(10).lean(),
      DietPlan.findOne({ userId: student._id, status: 'active' }).sort({ createdAt: -1 }).lean(),
    ]);

    const latestAssessment = assessments.length > 0 ? assessments[0] : null;

    // Calculate BMI if available
    const bmi = (profile?.height && profile?.weight)
      ? Math.round((profile.weight / Math.pow(profile.height / 100, 2)) * 10) / 10
      : null;

    const formattedStudentId = student.studentId || `ATH-${student._id.toString().slice(-6).toUpperCase()}`;
    const pointsEarned = participations.reduce((sum, p) => sum + (p.pointsAwarded || 0), 0);

    const workoutOverview = workoutPlanDoc ? {
      goal: workoutPlanDoc.goal || 'General Fitness',
      weeklyCompletionPercentage: workoutPlanDoc.weeklyCompletionPercentage || 0,
      completedActivitiesCount: workoutPlanDoc.completedActivitiesCount || 0,
      totalActivitiesCount: workoutPlanDoc.totalActivitiesCount || 0,
      daysPerWeek: workoutPlanDoc.daysPerWeek || (workoutPlanDoc.workouts ? workoutPlanDoc.workouts.length : 0),
      focusAreas: workoutPlanDoc.focusAreas || [],
      lastUpdated: workoutPlanDoc.updatedAt || workoutPlanDoc.createdAt
    } : null;

    const nutritionOverview = {
      totalMealsLogged: meals.length,
      averageCalories: meals.length > 0
        ? Math.round(meals.reduce((sum, m) => sum + (m.totalEstimatedCalories || 0), 0) / meals.length)
        : null,
      recentMeals: meals.slice(0, 5).map(m => ({
        id: m._id,
        loggedAt: m.createdAt,
        totalCalories: m.totalEstimatedCalories,
        totalProtein: m.totalProteinGrams || 0,
        foods: m.foods ? m.foods.map(f => f.name).join(', ') : 'Meal log'
      }))
    };

    const dietPlanOverview = dietPlanDoc ? {
      name: dietPlanDoc.name,
      goal: dietPlanDoc.goal,
      dietPreference: dietPlanDoc.dietPreference,
      restrictions: dietPlanDoc.restrictions || [],
      allergies: dietPlanDoc.allergies || [],
      mealsCount: dietPlanDoc.meals?.length || 0,
      meals: (dietPlanDoc.meals || []).map(m => ({
        mealType: m.mealType,
        foods: m.foods,
        calories: m.calories,
        protein: m.proteinGrams,
        notes: m.notes
      }))
    } : null;

    return res.status(200).json({
      student: {
        id: student._id,
        studentId: formattedStudentId,
        name: student.name,
        email: student.email,
        institutionId: student.institutionId,
        createdAt: student.createdAt,
        assessmentStatus: latestAssessment ? 'Completed' : 'Pending',
        fitnessScore: latestAssessment?.overallScore ?? null,
        fitnessLevel: latestAssessment?.fitnessLevel ?? null,
        profileStatus: profile ? 'Complete' : 'Incomplete',
        bmi: bmi,
        activitiesJoinedCount: participations.length,
        pointsEarned: pointsEarned,
        hasPhysiqueAnalysis: Boolean(physiqueDoc),
        physiqueStatus: physiqueDoc ? 'Physique analysis completed' : 'Not completed',
        workoutOverview,
        nutritionOverview,
        dietPlanOverview,
        joinedActivities: participations.map(p => ({
          id: p._id,
          title: p.activityId?.title || 'Institution Challenge',
          type: p.activityId?.type || 'challenge',
          pointsAwarded: p.pointsAwarded,
          joinedAt: p.joinedAt,
          status: p.status,
          activityStatus: p.activityId?.status || 'Active'
        })),
        profile: profile
          ? {
              age: profile.age,
              gender: profile.gender,
              height: profile.height,
              weight: profile.weight,
              location: profile.location || '',
              fitnessGoal: profile.fitnessGoal,
              activityLevel: profile.activityLevel,
              dietPreference: profile.dietPreference
            }
          : null,
        latestAssessment: latestAssessment
          ? {
              id: latestAssessment._id,
              assessmentDate: latestAssessment.assessmentDate,
              pushUps: latestAssessment.pushUps,
              sitUps: latestAssessment.sitUps,
              runTime: latestAssessment.runTime,
              flexibility: latestAssessment.flexibility,
              shuttleRun: latestAssessment.shuttleRun,
              overallScore: latestAssessment.overallScore,
              fitnessLevel: latestAssessment.fitnessLevel
            }
          : null,
        assessmentHistory: assessments.map((a) => ({
          id: a._id,
          assessmentDate: a.assessmentDate,
          overallScore: a.overallScore,
          fitnessLevel: a.fitnessLevel,
          pushUps: a.pushUps,
          sitUps: a.sitUps,
          runTime: a.runTime,
          flexibility: a.flexibility,
          shuttleRun: a.shuttleRun
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching student details:', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      message: error.message || 'Server error while fetching student details'
    });
  }
};

/**
 * POST /api/teacher/activities
 * Creates a new activity or challenge for the teacher's institution
 */
export const createTeacherActivity = async (req, res) => {
  try {
    const teacher = await getAuthenticatedTeacher(req.user.id);
    const institutionId = teacher.institutionId;

    if (!institutionId) {
      return res.status(400).json({
        message: 'Teacher must have an assigned institution ID to create activities',
      });
    }

    const { title, description, type, startDate, endDate, points } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'Activity title is required' });
    }

    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ message: 'Activity description is required' });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Valid start and end dates are required' });
    }

    if (end < start) {
      return res.status(400).json({ message: 'End date must be on or after start date' });
    }

    const parsedPoints = Number(points);
    if (isNaN(parsedPoints) || parsedPoints < 0) {
      return res.status(400).json({ message: 'Points must be a valid non-negative number' });
    }

    const validTypes = ['challenge', 'event'];
    const normalizedType =
      type && validTypes.includes(String(type).toLowerCase().trim())
        ? String(type).toLowerCase().trim()
        : 'challenge';

    const activity = await Activity.create({
      title: title.trim(),
      description: description.trim(),
      type: normalizedType,
      institutionId,
      createdBy: teacher._id,
      startDate: start,
      endDate: end,
      points: parsedPoints,
    });

    return res.status(201).json({
      message: 'Activity created successfully',
      activity: {
        id: activity._id,
        title: activity.title,
        description: activity.description,
        type: activity.type,
        institutionId: activity.institutionId,
        startDate: activity.startDate,
        endDate: activity.endDate,
        points: activity.points,
        status: activity.calculateStatus(),
        participantCount: 0,
        createdAt: activity.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating activity:', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      message: error.message || 'Server error while creating activity',
    });
  }
};

/**
 * GET /api/teacher/activities
 * Fetches all activities created for the teacher's institution
 */
export const getTeacherActivities = async (req, res) => {
  try {
    const teacher = await getAuthenticatedTeacher(req.user.id);
    const institutionId = teacher.institutionId;

    if (!institutionId) {
      return res.status(200).json({ activities: [] });
    }

    const activities = await Activity.find({ institutionId })
      .sort({ createdAt: -1 })
      .lean();

    const activityIds = activities.map((a) => a._id);

    const participations = await ActivityParticipation.aggregate([
      { $match: { activityId: { $in: activityIds } } },
      { $group: { _id: '$activityId', count: { $sum: 1 } } },
    ]);

    const countMap = new Map();
    for (const p of participations) {
      countMap.set(p._id.toString(), p.count);
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
        participantCount: countMap.get(act._id.toString()) || 0,
        createdAt: act.createdAt,
      };
    });

    return res.status(200).json({
      activities: formattedActivities,
    });
  } catch (error) {
    console.error('Error fetching teacher activities:', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      message: error.message || 'Server error while fetching activities',
    });
  }
};

/**
 * GET /api/teacher/talent-discovery
 * Identifies students who may show strengths in different fitness areas
 * based on verified real fitness assessments strictly within the teacher's institution.
 */
export const getTalentDiscovery = async (req, res) => {
  try {
    const teacher = await getAuthenticatedTeacher(req.user.id);
    const institutionId = teacher.institutionId;

    if (!institutionId) {
      return res.status(200).json({
        institutionId: null,
        talentList: [],
        totalStudents: 0,
        assessedCount: 0,
        unassessedCount: 0,
        message: 'No institution assigned to this teacher account',
      });
    }

    // Query ONLY students belonging to the teacher's institution
    const students = await User.find({
      role: 'student',
      institutionId: institutionId,
    })
      .select('_id name email institutionId studentId createdAt')
      .sort({ name: 1 })
      .lean();

    const studentIds = students.map((s) => s._id);

    // Retrieve assessments for these students
    const assessments = await FitnessAssessment.find({
      userId: { $in: studentIds },
    })
      .sort({ assessmentDate: -1, createdAt: -1 })
      .lean();

    const latestAssessmentsByStudentId = new Map();
    for (const a of assessments) {
      const sid = a.userId.toString();
      if (!latestAssessmentsByStudentId.has(sid)) {
        latestAssessmentsByStudentId.set(sid, a);
      }
    }

    let assessedCount = 0;
    let unassessedCount = 0;

    const talentList = students.map((student) => {
      const sid = student._id.toString();
      const assessment = latestAssessmentsByStudentId.get(sid) || null;
      const formattedStudentId = student.studentId || `ATH-${student._id.toString().slice(-6).toUpperCase()}`;

      if (!assessment) {
        unassessedCount += 1;
        return {
          id: student._id,
          studentId: formattedStudentId,
          name: student.name,
          email: student.email,
          institutionId: student.institutionId,
          hasAssessment: false,
          area: 'Not assessed',
          score: null,
          statusLabel: 'Needs Assessment',
          fitnessLevel: 'Not assessed',
          overallScore: null,
          metrics: null,
          assessmentDate: null,
        };
      }

      assessedCount += 1;

      // Calculate area indicators based on actual standardized tests:
      // Strength: Push-ups & Sit-ups (upper body & core power)
      const pushUps = Number(assessment.pushUps) || 0;
      const sitUps = Number(assessment.sitUps) || 0;
      const runTime = Number(assessment.runTime) || 0;
      const flexibility = Number(assessment.flexibility) || 0;
      const shuttleRun = Number(assessment.shuttleRun) || 0;

      const strengthScore = Math.min(100, Math.round(((Math.min(pushUps, 35) / 35) * 60) + ((Math.min(sitUps, 40) / 40) * 40)));

      // Endurance: sprint velocity (shorter runTime is faster), shuttle agility, sit-up stamina
      const runScore = Math.max(30, Math.min(100, Math.round(100 - (Math.max(8, runTime) - 8) * 8)));
      const shuttleScore = Math.max(30, Math.min(100, Math.round(100 - (Math.max(9, shuttleRun) - 9) * 12)));
      const enduranceScore = Math.min(100, Math.round((runScore * 0.4) + (shuttleScore * 0.35) + ((Math.min(sitUps, 40) / 40) * 25)));

      // Flexibility: sit-and-reach hamstring & lower back range
      const flexibilityScore = Math.max(30, Math.min(100, Math.round((Math.min(flexibility, 30) / 30) * 100)));

      // Overall Score
      const overallFitnessScore = assessment.overallScore !== undefined && assessment.overallScore !== null
        ? Number(assessment.overallScore)
        : Math.round((strengthScore + enduranceScore + flexibilityScore) / 3);

      // Determine area of relative strength
      let area = 'Overall Fitness';
      let statusLabel = 'Balanced Fitness';
      let score = overallFitnessScore;

      if (enduranceScore >= strengthScore && enduranceScore >= flexibilityScore && enduranceScore > 70) {
        area = 'Endurance';
        statusLabel = 'Strong in Endurance';
        score = enduranceScore;
      } else if (flexibilityScore >= strengthScore && flexibilityScore >= enduranceScore && flexibilityScore > 70) {
        area = 'Flexibility';
        statusLabel = 'Strong in Flexibility';
        score = flexibilityScore;
      } else if (strengthScore >= enduranceScore && strengthScore >= flexibilityScore && strengthScore > 70) {
        area = 'Strength';
        statusLabel = 'Strong in Strength';
        score = strengthScore;
      } else {
        area = 'Overall Fitness';
        statusLabel = overallFitnessScore >= 75 ? 'Strong Overall Fitness' : 'Balanced Fitness';
        score = overallFitnessScore;
      }

      return {
        id: student._id,
        studentId: formattedStudentId,
        name: student.name,
        email: student.email,
        institutionId: student.institutionId,
        hasAssessment: true,
        area,
        score,
        statusLabel,
        fitnessLevel: assessment.fitnessLevel || 'intermediate',
        overallScore: overallFitnessScore,
        metrics: {
          pushUps,
          sitUps,
          runTime,
          flexibility,
          shuttleRun,
          strengthScore,
          enduranceScore,
          flexibilityScore,
        },
        assessmentDate: assessment.assessmentDate || assessment.createdAt,
      };
    });

    return res.status(200).json({
      institutionId,
      talentList,
      totalStudents: students.length,
      assessedCount,
      unassessedCount,
    });
  } catch (error) {
    console.error('Error fetching talent discovery:', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      message: error.message || 'Server error while evaluating talent discovery',
    });
  }
};

/**
 * GET /api/teacher/student-insights
 * Aggregates institution-level statistics based on verified real student assessment data.
 */
export const getStudentInsights = async (req, res) => {
  try {
    const teacher = await getAuthenticatedTeacher(req.user.id);
    const institutionId = teacher.institutionId;

    if (!institutionId) {
      return res.status(200).json({
        institutionId: null,
        totalStudents: 0,
        assessedStudents: 0,
        unassessedStudents: 0,
        completionPercentage: 0,
        averageFitnessScore: null,
        distributionByLevel: { beginner: 0, intermediate: 0, advanced: 0, unassessed: 0 },
        fitnessAreasAverages: { strength: 0, endurance: 0, flexibility: 0 },
      });
    }

    // Query students belonging to teacher's institution
    const students = await User.find({
      role: 'student',
      institutionId: institutionId,
    })
      .select('_id')
      .lean();

    const totalStudents = students.length;
    if (totalStudents === 0) {
      return res.status(200).json({
        institutionId,
        totalStudents: 0,
        assessedStudents: 0,
        unassessedStudents: 0,
        completionPercentage: 0,
        averageFitnessScore: null,
        distributionByLevel: { beginner: 0, intermediate: 0, advanced: 0, unassessed: 0 },
        fitnessAreasAverages: { strength: 0, endurance: 0, flexibility: 0 },
      });
    }

    const studentIds = students.map((s) => s._id);

    const assessments = await FitnessAssessment.find({
      userId: { $in: studentIds },
    })
      .sort({ assessmentDate: -1, createdAt: -1 })
      .lean();

    const latestAssessmentsByStudentId = new Map();
    for (const a of assessments) {
      const sid = a.userId.toString();
      if (!latestAssessmentsByStudentId.has(sid)) {
        latestAssessmentsByStudentId.set(sid, a);
      }
    }

    const assessedStudents = latestAssessmentsByStudentId.size;
    const unassessedStudents = Math.max(0, totalStudents - assessedStudents);
    const completionPercentage = Math.round((assessedStudents / totalStudents) * 100);

    let totalScoreSum = 0;
    let scoredCount = 0;
    const levelCounts = { beginner: 0, intermediate: 0, advanced: 0, unassessed: unassessedStudents };

    let totalStrengthSum = 0;
    let totalEnduranceSum = 0;
    let totalFlexibilitySum = 0;
    let rawPushUpsSum = 0;
    let rawSitUpsSum = 0;
    let rawRunTimeSum = 0;
    let rawFlexibilitySum = 0;

    for (const a of latestAssessmentsByStudentId.values()) {
      const score = Number(a.overallScore);
      if (!isNaN(score)) {
        totalScoreSum += score;
        scoredCount += 1;
      }

      const level = (a.fitnessLevel || 'intermediate').toLowerCase();
      if (levelCounts[level] !== undefined) {
        levelCounts[level] += 1;
      } else {
        levelCounts.intermediate += 1;
      }

      const pu = Number(a.pushUps) || 0;
      const su = Number(a.sitUps) || 0;
      const rt = Number(a.runTime) || 0;
      const fl = Number(a.flexibility) || 0;
      const sh = Number(a.shuttleRun) || 0;

      rawPushUpsSum += pu;
      rawSitUpsSum += su;
      rawRunTimeSum += rt;
      rawFlexibilitySum += fl;

      const sScore = Math.min(100, Math.round(((Math.min(pu, 35) / 35) * 60) + ((Math.min(su, 40) / 40) * 40)));
      const runScore = Math.max(30, Math.min(100, Math.round(100 - (Math.max(8, rt) - 8) * 8)));
      const shuttleScore = Math.max(30, Math.min(100, Math.round(100 - (Math.max(9, sh) - 9) * 12)));
      const eScore = Math.min(100, Math.round((runScore * 0.4) + (shuttleScore * 0.35) + ((Math.min(su, 40) / 40) * 25)));
      const fScore = Math.max(30, Math.min(100, Math.round((Math.min(fl, 30) / 30) * 100)));

      totalStrengthSum += sScore;
      totalEnduranceSum += eScore;
      totalFlexibilitySum += fScore;
    }

    const averageFitnessScore = scoredCount > 0 ? Math.round((totalScoreSum / scoredCount) * 10) / 10 : null;

    const fitnessAreasAverages = assessedStudents > 0
      ? {
          strength: Math.round(totalStrengthSum / assessedStudents),
          endurance: Math.round(totalEnduranceSum / assessedStudents),
          flexibility: Math.round(totalFlexibilitySum / assessedStudents),
          avgPushUps: Math.round((rawPushUpsSum / assessedStudents) * 10) / 10,
          avgSitUps: Math.round((rawSitUpsSum / assessedStudents) * 10) / 10,
          avgRunTime: Math.round((rawRunTimeSum / assessedStudents) * 10) / 10,
          avgFlexibilityCm: Math.round((rawFlexibilitySum / assessedStudents) * 10) / 10,
        }
      : {
          strength: 0,
          endurance: 0,
          flexibility: 0,
          avgPushUps: 0,
          avgSitUps: 0,
          avgRunTime: 0,
          avgFlexibilityCm: 0,
        };

    return res.status(200).json({
      institutionId,
      totalStudents,
      assessedStudents,
      unassessedStudents,
      completionPercentage,
      averageFitnessScore,
      distributionByLevel: {
        beginner: { count: levelCounts.beginner, percentage: Math.round((levelCounts.beginner / totalStudents) * 100) },
        intermediate: { count: levelCounts.intermediate, percentage: Math.round((levelCounts.intermediate / totalStudents) * 100) },
        advanced: { count: levelCounts.advanced, percentage: Math.round((levelCounts.advanced / totalStudents) * 100) },
        unassessed: { count: levelCounts.unassessed, percentage: Math.round((levelCounts.unassessed / totalStudents) * 100) },
      },
      fitnessAreasAverages,
    });
  } catch (error) {
    console.error('Error fetching student insights:', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      message: error.message || 'Server error while calculating student insights',
    });
  }
};

