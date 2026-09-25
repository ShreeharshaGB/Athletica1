import mongoose from 'mongoose';

const fitnessAssessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assessmentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    pushUps: {
      type: Number,
      required: true,
      min: 0,
    },
    sitUps: {
      type: Number,
      required: true,
      min: 0,
    },
    runTime: {
      type: Number,
      required: true,
      min: 0,
    },
    flexibility: {
      type: Number,
      required: true,
      min: 0,
    },
    shuttleRun: {
      type: Number,
      required: true,
      min: 0,
    },
    overallScore: {
      type: Number,
    },
    fitnessLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
    },
  },
  {
    timestamps: true,
  }
);

const FitnessAssessment = mongoose.model('FitnessAssessment', fitnessAssessmentSchema);

export default FitnessAssessment;
export { FitnessAssessment };
