import mongoose from 'mongoose';
import WorkoutPlan from '../models/WorkoutPlan.js';

const VALID_SOURCES = ['ai_generated', 'teacher_assigned', 'self_created'];
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
    title: workout.title.trim(),
    durationMinutes: Number(workout.durationMinutes),
    exercises: workout.exercises.map((exercise) => ({
      name: exercise.name.trim(),
      sets: Number(exercise.sets),
      reps: Number(exercise.reps),
      ...(exercise.durationSeconds !== undefined && exercise.durationSeconds !== null && exercise.durationSeconds !== ''
        ? { durationSeconds: Number(exercise.durationSeconds) }
        : {}),
      restSeconds:
        exercise.restSeconds !== undefined && exercise.restSeconds !== null && exercise.restSeconds !== ''
          ? Number(exercise.restSeconds)
          : 0,
      equipment: typeof exercise.equipment === 'string' && exercise.equipment.trim()
        ? exercise.equipment.trim()
        : 'none / bodyweight',
      notes: typeof exercise.notes === 'string' ? exercise.notes.trim() : '',
    })),
  }));

const formatPlan = (plan) => ({
  id: plan._id,
  userId: plan.userId,
  source: plan.source,
  goal: plan.goal,
  startDate: plan.startDate,
  endDate: plan.endDate,
  status: plan.status,
  workouts: plan.workouts,
  createdAt: plan.createdAt,
  updatedAt: plan.updatedAt,
});

export const createPlan = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        message: 'Only students can create a workout plan'
      });
    }

    const { source, goal, startDate, endDate, workouts } = req.body;

    if (typeof goal !== 'string' || !goal.trim()) {
      return res.status(400).json({
        message: 'Goal is required'
      });
    }

    let normalizedSource = 'self_created';
    if (source !== undefined) {
      if (typeof source !== 'string' || !VALID_SOURCES.includes(source.trim().toLowerCase())) {
        return res.status(400).json({
          message: `Source must be one of: ${VALID_SOURCES.join(', ')}`
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

    // Only one active plan at a time — supersede any existing active plan
    await WorkoutPlan.updateMany(
      { userId: req.user.id, status: 'active' },
      { $set: { status: 'superseded' } }
    );

    const newPlan = await WorkoutPlan.create({
      userId: req.user.id,
      source: normalizedSource,
      goal: goal.trim(),
      startDate: parsedStartDate,
      ...(parsedEndDate ? { endDate: parsedEndDate } : {}),
      status: 'active',
      workouts: normalizeWorkouts(workouts)
    });

    return res.status(201).json({
      message: 'Workout plan created successfully',
      plan: formatPlan(newPlan)
    });
  } catch (error) {
    console.error('Create workout plan error:', error);
    return res.status(500).json({
      message: 'Server error while creating workout plan'
    });
  }
};

export const getActivePlan = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        message: 'Only students can access a workout plan'
      });
    }

    const plan = await WorkoutPlan.findOne({ userId: req.user.id, status: 'active' })
      .sort({ startDate: -1, createdAt: -1 });

    if (!plan) {
      return res.status(404).json({
        message: 'No active workout plan found'
      });
    }

    return res.status(200).json({
      plan: formatPlan(plan)
    });
  } catch (error) {
    console.error('Get active workout plan error:', error);
    return res.status(500).json({
      message: 'Server error while fetching workout plan'
    });
  }
};

export const getPlanHistory = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        message: 'Only students can access workout plan history'
      });
    }

    const plans = await WorkoutPlan.find({ userId: req.user.id })
      .sort({ startDate: -1, createdAt: -1 });

    return res.status(200).json({
      plans: plans.map(formatPlan)
    });
  } catch (error) {
    console.error('Get workout plan history error:', error);
    return res.status(500).json({
      message: 'Server error while fetching workout plan history'
    });
  }
};

export const updatePlan = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        message: 'Only students can update a workout plan'
      });
    }

    const { planId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(planId)) {
      return res.status(404).json({
        message: 'Workout plan not found'
      });
    }

    const plan = await WorkoutPlan.findById(planId);

    if (!plan) {
      return res.status(404).json({
        message: 'Workout plan not found'
      });
    }

    if (plan.userId.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'You are not authorized to modify this workout plan'
      });
    }

    const { goal, endDate, status, workouts } = req.body;

    if (goal !== undefined) {
      if (typeof goal !== 'string' || !goal.trim()) {
        return res.status(400).json({ message: 'Goal cannot be empty' });
      }
      plan.goal = goal.trim();
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
          message: `Status must be one of: ${VALID_STATUSES.join(', ')}`
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
    }

    // Explicitly guarantee ownership is never modified
    plan.userId = req.user.id;

    await plan.save();

    return res.status(200).json({
      message: 'Workout plan updated successfully',
      plan: formatPlan(plan)
    });
  } catch (error) {
    console.error('Update workout plan error:', error);
    return res.status(500).json({
      message: 'Server error while updating workout plan'
    });
  }
};
