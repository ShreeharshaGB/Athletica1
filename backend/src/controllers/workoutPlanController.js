import mongoose from 'mongoose';
import WorkoutPlan from '../models/WorkoutPlan.js';
import FitnessAssessment from '../models/FitnessAssessment.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import ActivityParticipation from '../models/ActivityParticipation.js';
import { generateWorkoutPlan } from '../services/workoutPlanService.js';

const VALID_SOURCES = ['ai_generated', 'deterministic_fallback', 'teacher_assigned', 'self_created'];
const VALID_STATUSES = ['active', 'completed', 'superseded', 'abandoned'];
const VALID_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const validatePositiveNumber = (val, fieldName, { allowUndefined = false } = {}) => {
  if (val === undefined || val === null || val === '') {
    return allowUndefined ? null : `${fieldName} is required`;
  }
  if (typeof val === 'boolean' || Array.isArray(val) || (typeof val === 'object' && val !== null)) {
    return `${fieldName} must be a valid number`;
  }
  const num = Number(val);
  if (isNaN(num)) {
    return `${fieldName} must be a valid number`;
  }
  if (num < 0) {
    return `${fieldName} cannot be negative`;
  }
  return null;
};

const validateExercise = (exercise, workoutIndex, exerciseIndex) => {
  const prefix = `Workout ${workoutIndex + 1}, exercise ${exerciseIndex + 1}`;

  if (!exercise || typeof exercise !== 'object' || Array.isArray(exercise)) {
    return `${prefix} must be a valid object`;
  }

  if (typeof exercise.name !== 'string' || !exercise.name.trim()) {
    return `${prefix}: name is required`;
  }

  let errorMsg = validatePositiveNumber(exercise.sets, `${prefix}: sets`);
  if (errorMsg) return errorMsg;

  errorMsg = validatePositiveNumber(exercise.reps, `${prefix}: reps`);
  if (errorMsg) return errorMsg;

  errorMsg = validatePositiveNumber(exercise.durationSeconds, `${prefix}: durationSeconds`, { allowUndefined: true });
  if (errorMsg) return errorMsg;

  errorMsg = validatePositiveNumber(exercise.restSeconds, `${prefix}: restSeconds`, { allowUndefined: true });
  if (errorMsg) return errorMsg;

  return null;
};

const validateWorkout = (workout, index) => {
  if (!workout || typeof workout !== 'object' || Array.isArray(workout)) {
    return `Workout ${index + 1} must be a valid object`;
  }

  if (
    typeof workout.dayOfWeek !== 'string' ||
    !VALID_DAYS.includes(workout.dayOfWeek.trim().toLowerCase())
  ) {
    return `Workout ${index + 1}: dayOfWeek must be one of: ${VALID_DAYS.join(', ')}`;
  }

  if (typeof workout.title !== 'string' || !workout.title.trim()) {
    return `Workout ${index + 1}: title is required`;
  }

  const durationError = validatePositiveNumber(workout.durationMinutes, `Workout ${index + 1}: durationMinutes`);
  if (durationError) return durationError;

  if (!Array.isArray(workout.exercises) || workout.exercises.length === 0) {
    return `Workout ${index + 1} must include at least one exercise`;
  }

  for (let i = 0; i < workout.exercises.length; i += 1) {
    const exerciseError = validateExercise(workout.exercises[i], index, i);
    if (exerciseError) return exerciseError;
  }

  return null;
};

const validateWorkouts = (workouts) => {
  if (!Array.isArray(workouts) || workouts.length === 0) {
    return 'At least one scheduled workout is required';
  }

  for (let i = 0; i < workouts.length; i += 1) {
    const workoutError = validateWorkout(workouts[i], i);
    if (workoutError) return workoutError;
  }

  return null;
};

const normalizeWorkouts = (workouts) =>
  workouts.map((workout) => ({
    dayOfWeek: workout.dayOfWeek.trim().toLowerCase(),
    focus: typeof workout.focus === 'string' ? workout.focus.trim() : '',
    title: workout.title.trim(),
    durationMinutes: Number(workout.durationMinutes) || 30,
    exercises: workout.exercises.map((exercise) => ({
      id: exercise.id || new mongoose.Types.ObjectId().toString(),
      name: exercise.name.trim(),
      category: typeof exercise.category === 'string' ? exercise.category.trim() : 'General',
      sets: Number(exercise.sets) || 3,
      reps: Number(exercise.reps) || 10,
      duration: typeof exercise.duration === 'string' ? exercise.duration.trim() : '',
      ...(exercise.durationSeconds !== undefined && exercise.durationSeconds !== null && exercise.durationSeconds !== ''
        ? { durationSeconds: Number(exercise.durationSeconds) }
        : { durationSeconds: 0 }),
      difficulty: typeof exercise.difficulty === 'string' ? exercise.difficulty.trim() : 'Beginner',
      instructions: typeof exercise.instructions === 'string' ? exercise.instructions.trim() : '',
      isCompleted: Boolean(exercise.isCompleted),
      completedAt: exercise.completedAt ? new Date(exercise.completedAt) : null,
      restSeconds:
        exercise.restSeconds !== undefined && exercise.restSeconds !== null && exercise.restSeconds !== ''
          ? Number(exercise.restSeconds)
          : 30,
      equipment: typeof exercise.equipment === 'string' && exercise.equipment.trim()
        ? exercise.equipment.trim()
        : 'none / bodyweight',
      notes: typeof exercise.notes === 'string' ? exercise.notes.trim() : '',
    })),
  }));

const formatPlan = (plan) => ({
  id: plan._id,
  userId: plan.userId,
  role: plan.role,
  source: plan.source,
  goal: plan.goal,
  fitnessLevel: plan.fitnessLevel,
  availableTimeMinutes: plan.availableTimeMinutes,
  dailyActivityContext: plan.dailyActivityContext || '',
  weeklyCompletionPercentage: plan.weeklyCompletionPercentage || 0,
  completedActivitiesCount: plan.completedActivitiesCount || 0,
  totalActivitiesCount: plan.totalActivitiesCount || 0,
  startDate: plan.startDate,
  endDate: plan.endDate,
  status: plan.status,
  workouts: plan.workouts,
  createdAt: plan.createdAt,
  updatedAt: plan.updatedAt,
});

/**
 * POST /api/student/workout-plan
 * Manually creates or saves a workout plan.
 */
export const createPlan = async (req, res) => {
  try {
    if (req.user.role !== 'student' && req.user.role !== 'community') {
      return res.status(403).json({
        message: 'Only students and community members can create a workout plan',
      });
    }

    const { source, goal, startDate, endDate, workouts, dailyActivityContext, fitnessLevel, availableTimeMinutes } = req.body;

    if (typeof goal !== 'string' || !goal.trim()) {
      return res.status(400).json({
        message: 'Goal is required',
      });
    }

    let normalizedSource = 'self_created';
    if (source !== undefined) {
      if (typeof source !== 'string' || !VALID_SOURCES.includes(source.trim().toLowerCase())) {
        return res.status(400).json({
          message: `Source must be one of: ${VALID_SOURCES.join(', ')}`,
        });
      }
      normalizedSource = source.trim().toLowerCase();
    }

    let parsedStartDate = new Date();
    if (startDate !== undefined && startDate !== null) {
      const d = new Date(startDate);
      if (isNaN(d.getTime())) {
        return res.status(400).json({ message: 'Invalid start date format' });
      }
      parsedStartDate = d;
    }

    let parsedEndDate;
    if (endDate !== undefined && endDate !== null && endDate !== '') {
      const d = new Date(endDate);
      if (isNaN(d.getTime())) {
        return res.status(400).json({ message: 'Invalid end date format' });
      }
      parsedEndDate = d;
    }

    const workoutsError = validateWorkouts(workouts);
    if (workoutsError) {
      return res.status(400).json({ message: workoutsError });
    }

    const normalizedWorkoutsList = normalizeWorkouts(workouts);
    let totalCount = 0;
    let completedCount = 0;
    for (const w of normalizedWorkoutsList) {
      totalCount += (w.exercises || []).length;
      completedCount += (w.exercises || []).filter((ex) => ex.isCompleted).length;
    }

    // Only one active plan at a time — supersede any existing active plan
    await WorkoutPlan.updateMany(
      { userId: req.user.id, status: 'active' },
      { $set: { status: 'superseded' } }
    );

    const newPlan = await WorkoutPlan.create({
      userId: req.user.id,
      role: req.user.role,
      source: normalizedSource,
      goal: goal.trim(),
      fitnessLevel: fitnessLevel || 'beginner',
      availableTimeMinutes: Number(availableTimeMinutes) || 30,
      dailyActivityContext: dailyActivityContext || '',
      weeklyCompletionPercentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
      completedActivitiesCount: completedCount,
      totalActivitiesCount: totalCount,
      startDate: parsedStartDate,
      ...(parsedEndDate ? { endDate: parsedEndDate } : {}),
      status: 'active',
      workouts: normalizedWorkoutsList,
    });

    return res.status(201).json({
      message: 'Workout plan created successfully',
      plan: formatPlan(newPlan),
    });
  } catch (error) {
    console.error('Create workout plan error:', error);
    return res.status(500).json({
      message: 'Server error while creating workout plan',
    });
  }
};

/**
 * GET /api/student/workout-plan
 * Fetches the user's active plan, or auto-generates one calibrated to assessment/profile.
 */
export const getActivePlan = async (req, res) => {
  try {
    if (req.user.role !== 'student' && req.user.role !== 'community') {
      return res.status(403).json({
        message: 'Only students and community members can access a workout plan',
      });
    }

    // Look up user's assessment if student
    const assessment = await FitnessAssessment.findOne({ userId: req.user.id })
      .sort({ assessmentDate: -1, createdAt: -1 });

    let plan = await WorkoutPlan.findOne({ userId: req.user.id, status: 'active' })
      .sort({ startDate: -1, createdAt: -1 });

    // Auto-generate plan if none exists
    if (!plan) {
      const generated = await generateWorkoutPlan({
        role: req.user.role,
        fitnessLevel: assessment?.fitnessLevel || 'beginner',
        goal: 'General Fitness',
        availableTimeMinutes: 30,
        dailyActivityContext: '',
        studentAssessment: assessment,
      });

      let totalActivities = 0;
      for (const w of generated.workouts) {
        totalActivities += (w.exercises || []).length;
      }

      plan = await WorkoutPlan.create({
        userId: req.user.id,
        role: req.user.role,
        source: generated.source,
        goal: generated.goal,
        fitnessLevel: generated.fitnessLevel,
        availableTimeMinutes: generated.availableTimeMinutes,
        dailyActivityContext: generated.dailyActivityContext || '',
        weeklyCompletionPercentage: 0,
        completedActivitiesCount: 0,
        totalActivitiesCount: totalActivities,
        startDate: new Date(),
        status: 'active',
        workouts: generated.workouts,
      });
    }

    return res.status(200).json({
      plan: formatPlan(plan),
      hasAssessment: Boolean(assessment),
      assessmentSummary: assessment
        ? {
            overallScore: assessment.overallScore,
            fitnessLevel: assessment.fitnessLevel,
            pushUps: assessment.pushUps,
            sitUps: assessment.sitUps,
            runTime: assessment.runTime,
            flexibility: assessment.flexibility,
            shuttleRun: assessment.shuttleRun,
          }
        : null,
    });
  } catch (error) {
    console.error('Get active workout plan error:', error);
    return res.status(500).json({
      message: 'Server error while fetching workout plan',
    });
  }
};

/**
 * POST /api/student/workout-plan/generate
 * Generates and updates user's active workout plan using AI or deterministic fallback.
 */
export const generateOrUpdatePlan = async (req, res) => {
  try {
    if (req.user.role !== 'student' && req.user.role !== 'community') {
      return res.status(403).json({
        message: 'Only students and community members can generate a workout plan',
      });
    }

    const { goal, fitnessLevel, availableTimeMinutes, dailyActivityContext } = req.body;

    const assessment = await FitnessAssessment.findOne({ userId: req.user.id })
      .sort({ assessmentDate: -1, createdAt: -1 });

    const selectedFitnessLevel = fitnessLevel || assessment?.fitnessLevel || 'beginner';
    const selectedGoal = goal || 'General Fitness';
    const selectedTime = Number(availableTimeMinutes) || 30;
    const selectedContext = req.user.role === 'community' ? String(dailyActivityContext || '').trim() : '';

    const generated = await generateWorkoutPlan({
      role: req.user.role,
      fitnessLevel: selectedFitnessLevel,
      goal: selectedGoal,
      availableTimeMinutes: selectedTime,
      dailyActivityContext: selectedContext,
      studentAssessment: assessment,
    });

    // Supersede any prior active plan
    await WorkoutPlan.updateMany(
      { userId: req.user.id, status: 'active' },
      { $set: { status: 'superseded' } }
    );

    let totalActivities = 0;
    for (const w of generated.workouts) {
      totalActivities += (w.exercises || []).length;
    }

    const newPlan = await WorkoutPlan.create({
      userId: req.user.id,
      role: req.user.role,
      source: generated.source,
      goal: generated.goal,
      fitnessLevel: generated.fitnessLevel,
      availableTimeMinutes: generated.availableTimeMinutes,
      dailyActivityContext: generated.dailyActivityContext || '',
      weeklyCompletionPercentage: 0,
      completedActivitiesCount: 0,
      totalActivitiesCount: totalActivities,
      startDate: new Date(),
      status: 'active',
      workouts: generated.workouts,
    });

    return res.status(201).json({
      message: 'Workout plan generated successfully',
      plan: formatPlan(newPlan),
      hasAssessment: Boolean(assessment),
    });
  } catch (error) {
    console.error('Generate workout plan error:', error);
    return res.status(500).json({
      message: 'Server error while generating workout plan',
    });
  }
};

/**
 * POST /api/student/workout-plan/activity/toggle
 * Marks an individual exercise as completed or incomplete and updates weekly percentage.
 * Seamlessly credits points to user's Gamification profile.
 */
export const toggleActivityCompletion = async (req, res) => {
  try {
    if (req.user.role !== 'student' && req.user.role !== 'community') {
      return res.status(403).json({
        message: 'Only students and community members can complete workout activities',
      });
    }

    const { dayOfWeek, exerciseId, exerciseIndex, isCompleted } = req.body;

    const plan = await WorkoutPlan.findOne({ userId: req.user.id, status: 'active' });
    if (!plan) {
      return res.status(404).json({ message: 'No active workout plan found' });
    }

    const normDay = String(dayOfWeek || '').toLowerCase().trim();
    const workout = plan.workouts.find((w) => w.dayOfWeek === normDay);
    if (!workout) {
      return res.status(400).json({ message: `Workout day '${dayOfWeek}' not found in active plan` });
    }

    let exercise = null;
    if (exerciseId) {
      exercise = workout.exercises.find((ex) => ex.id === exerciseId);
    }
    if (!exercise && typeof exerciseIndex === 'number' && workout.exercises[exerciseIndex]) {
      exercise = workout.exercises[exerciseIndex];
    }
    if (!exercise && workout.exercises.length > 0) {
      exercise = workout.exercises[0];
    }

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found in workout day' });
    }

    const newCompleted = typeof isCompleted === 'boolean' ? isCompleted : !exercise.isCompleted;
    exercise.isCompleted = newCompleted;
    exercise.completedAt = newCompleted ? new Date() : null;

    // Recalculate completion metrics
    let totalCount = 0;
    let completedCount = 0;
    for (const w of plan.workouts) {
      for (const ex of w.exercises) {
        totalCount += 1;
        if (ex.isCompleted) completedCount += 1;
      }
    }

    plan.totalActivitiesCount = totalCount;
    plan.completedActivitiesCount = completedCount;
    plan.weeklyCompletionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    let pointsAwarded = 0;
    if (newCompleted) {
      pointsAwarded = 15;
      try {
        const user = await User.findById(req.user.id).select('institutionId communityId role');
        if (user) {
          const filter = {
            title: 'Daily Workout Session',
            ...(user.role === 'community' && user.communityId ? { communityId: user.communityId } : {}),
            ...(user.role === 'student' && user.institutionId ? { institutionId: user.institutionId } : {}),
          };

          let act = await Activity.findOne(filter);
          if (!act) {
            act = await Activity.create({
              title: 'Daily Workout Session',
              description: 'Consistent execution of personalized daily physical activity routines.',
              type: 'challenge',
              institutionId: user.role === 'student' ? user.institutionId : null,
              communityId: user.role === 'community' ? user.communityId : null,
              createdBy: user._id,
              startDate: new Date(Date.now() - 86400000 * 30),
              endDate: new Date(Date.now() + 86400000 * 365),
              points: 15,
            });
          }

          let part = await ActivityParticipation.findOne({
            activityId: act._id,
            studentId: user._id,
          });

          if (!part) {
            await ActivityParticipation.create({
              activityId: act._id,
              studentId: user._id,
              institutionId: user.institutionId || null,
              communityId: user.communityId || null,
              status: 'completed',
              pointsAwarded: 15,
            });
          } else {
            part.pointsAwarded = (part.pointsAwarded || 0) + 15;
            part.status = 'completed';
            await part.save();
          }
        }
      } catch (gamifyErr) {
        console.warn('Gamification points integration note:', gamifyErr.message);
      }
    }

    await plan.save();

    return res.status(200).json({
      message: newCompleted ? 'Activity completed! Gamification points awarded.' : 'Activity marked incomplete',
      plan: formatPlan(plan),
      pointsAwarded,
      exercise: {
        id: exercise.id,
        name: exercise.name,
        isCompleted: exercise.isCompleted,
        completedAt: exercise.completedAt,
      },
    });
  } catch (error) {
    console.error('Toggle activity completion error:', error);
    return res.status(500).json({
      message: 'Server error while toggling activity completion',
    });
  }
};

export const getPlanHistory = async (req, res) => {
  try {
    if (req.user.role !== 'student' && req.user.role !== 'community') {
      return res.status(403).json({
        message: 'Only students and community members can access workout plan history',
      });
    }

    const plans = await WorkoutPlan.find({ userId: req.user.id })
      .sort({ startDate: -1, createdAt: -1 });

    return res.status(200).json({
      plans: plans.map(formatPlan),
    });
  } catch (error) {
    console.error('Get workout plan history error:', error);
    return res.status(500).json({
      message: 'Server error while fetching workout plan history',
    });
  }
};

export const updatePlan = async (req, res) => {
  try {
    if (req.user.role !== 'student' && req.user.role !== 'community') {
      return res.status(403).json({
        message: 'Only students and community members can update a workout plan',
      });
    }

    const { planId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(planId)) {
      return res.status(404).json({
        message: 'Workout plan not found',
      });
    }

    const plan = await WorkoutPlan.findById(planId);

    if (!plan) {
      return res.status(404).json({
        message: 'Workout plan not found',
      });
    }

    if (plan.userId.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'You are not authorized to modify this workout plan',
      });
    }

    const { goal, endDate, status, workouts, fitnessLevel, availableTimeMinutes, dailyActivityContext } = req.body;

    if (goal !== undefined) {
      if (typeof goal !== 'string' || !goal.trim()) {
        return res.status(400).json({ message: 'Goal cannot be empty' });
      }
      plan.goal = goal.trim();
    }

    if (fitnessLevel !== undefined) {
      plan.fitnessLevel = String(fitnessLevel).trim();
    }

    if (availableTimeMinutes !== undefined) {
      plan.availableTimeMinutes = Number(availableTimeMinutes) || 30;
    }

    if (dailyActivityContext !== undefined) {
      plan.dailyActivityContext = String(dailyActivityContext).trim();
    }

    if (endDate !== undefined) {
      if (endDate === null || endDate === '') {
        plan.endDate = undefined;
      } else {
        const d = new Date(endDate);
        if (isNaN(d.getTime())) {
          return res.status(400).json({ message: 'Invalid end date format' });
        }
        plan.endDate = d;
      }
    }

    if (status !== undefined) {
      if (typeof status !== 'string' || !VALID_STATUSES.includes(status.trim().toLowerCase())) {
        return res.status(400).json({
          message: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
        });
      }
      plan.status = status.trim().toLowerCase();
    }

    if (workouts !== undefined) {
      const workoutsError = validateWorkouts(workouts);
      if (workoutsError) {
        return res.status(400).json({ message: workoutsError });
      }
      plan.workouts = normalizeWorkouts(workouts);
      let totalCount = 0;
      let completedCount = 0;
      for (const w of plan.workouts) {
        totalCount += (w.exercises || []).length;
        completedCount += (w.exercises || []).filter((ex) => ex.isCompleted).length;
      }
      plan.totalActivitiesCount = totalCount;
      plan.completedActivitiesCount = completedCount;
      plan.weeklyCompletionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    }

    // Explicitly guarantee ownership is never modified
    plan.userId = req.user.id;

    await plan.save();

    return res.status(200).json({
      message: 'Workout plan updated successfully',
      plan: formatPlan(plan),
    });
  } catch (error) {
    console.error('Update workout plan error:', error);
    return res.status(500).json({
      message: 'Server error while updating workout plan',
    });
  }
};
