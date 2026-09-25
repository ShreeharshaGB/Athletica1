import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['challenge', 'event'],
      default: 'challenge',
      lowercase: true,
      trim: true,
    },
    institutionId: {
      type: String,
      uppercase: true,
      trim: true,
      index: true,
      default: null,
    },
    communityId: {
      type: String,
      uppercase: true,
      trim: true,
      index: true,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    points: {
      type: Number,
      required: true,
      min: 0,
      default: 50,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Calculates current dynamic status based on startDate and endDate
 */
activitySchema.methods.calculateStatus = function () {
  const now = new Date();
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);

  if (now < start) return 'Upcoming';
  if (now > end) return 'Completed';
  return 'Active';
};

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
export { Activity };
