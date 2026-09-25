import mongoose from 'mongoose';

const activityParticipationSchema = new mongoose.Schema(
  {
    activityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity',
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    institutionId: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['joined', 'completed'],
      default: 'joined',
    },
    pointsAwarded: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate participation by the same student in the same activity
activityParticipationSchema.index({ activityId: 1, studentId: 1 }, { unique: true });

const ActivityParticipation = mongoose.model(
  'ActivityParticipation',
  activityParticipationSchema
);

export default ActivityParticipation;
export { ActivityParticipation };
