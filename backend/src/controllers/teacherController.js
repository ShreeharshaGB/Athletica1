import User from '../models/User.js';
import FitnessAssessment from '../models/FitnessAssessment.js';
import StudentProfile from '../models/StudentProfile.js';

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

    // Assemble unified student objects
    const enrichedStudents = students.map((student) => {
      const studentIdStr = student._id.toString();
      const latestAssessment = latestAssessmentsByStudentId.get(studentIdStr) || null;
      const profile = profilesByStudentId.get(studentIdStr) || null;

      return {
        id: student._id,
        name: student.name,
        email: student.email,
        institutionId: student.institutionId,
        createdAt: student.createdAt,
        assessmentStatus: latestAssessment ? 'Completed' : 'Pending',
        fitnessScore: latestAssessment?.overallScore ?? null,
        fitnessLevel: latestAssessment?.fitnessLevel ?? null,
        profileStatus: profile ? 'Complete' : 'Incomplete',
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

    return res.status(200).json({
      students: enrichedStudents,
      institutionId: institutionId,
      total: enrichedStudents.length
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

    return res.status(200).json({
      totalStudents,
      assessmentsCompleted,
      assessmentsPending,
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

    const [profile, assessments] = await Promise.all([
      StudentProfile.findOne({ userId: student._id }).lean(),
      FitnessAssessment.find({ userId: student._id }).sort({ assessmentDate: -1, createdAt: -1 }).lean()
    ]);

    const latestAssessment = assessments.length > 0 ? assessments[0] : null;

    return res.status(200).json({
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        institutionId: student.institutionId,
        createdAt: student.createdAt,
        assessmentStatus: latestAssessment ? 'Completed' : 'Pending',
        fitnessScore: latestAssessment?.overallScore ?? null,
        fitnessLevel: latestAssessment?.fitnessLevel ?? null,
        profileStatus: profile ? 'Complete' : 'Incomplete',
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
