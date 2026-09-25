import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sets: {
      type: Number,
      required: true,
      min: 0,
    },
    reps: {
      type: Number,
      required: true,
      min: 0,
    },
    durationSeconds: {
      type: Number,
      min: 0,
    },
    restSeconds: {
      type: Number,
      min: 0,
      default: 0,
    },
    equipment: {
      type: String,
      trim: true,
      default: 'none / bodyweight',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: false }
);

const workoutSchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: String,
      required: true,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      lowercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 0,
    },
    exercises: {
      type: [exerciseSchema],
      required: true,
      validate: {
        validator: (val) => Array.isArray(val) && val.length > 0,
        message: 'Each workout must include at least one exercise',
      },
    },
  },
  { _id: false }
);

const workoutPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    source: {
      type: String,
      required: true,
      enum: ['ai_generated', 'teacher_assigned', 'self_created'],
      default: 'self_created',
    },
    goal: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'completed', 'superseded', 'abandoned'],
      default: 'active',
      index: true,
    },
    workouts: {
      type: [workoutSchema],
      required: true,
      validate: {
        validator: (val) => Array.isArray(val) && val.length > 0,
        message: 'A workout plan must include at least one scheduled workout',
      },
    },
  },
  {
    timestamps: true,
  }
);

workoutPlanSchema.index({ userId: 1, status: 1 });

const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);

export default WorkoutPlan;
export { WorkoutPlan };
