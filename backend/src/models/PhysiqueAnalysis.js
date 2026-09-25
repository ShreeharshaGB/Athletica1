import mongoose from 'mongoose';

const physiqueAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    image: {
      storageKey: {
        type: String,
        required: true,
      },
      mimeType: {
        type: String,
        required: true,
      },
      fileSize: {
        type: Number,
        required: true,
      },
    },
    analysis: {
      isSuitableImage: {
        type: Boolean,
        default: true,
      },
      unsuitableReason: {
        type: String,
        default: '',
      },
      summary: {
        type: String,
        default: '',
      },
      visibleObservations: {
        type: [String],
        default: [],
      },
      strengthFocus: {
        type: [String],
        default: [],
      },
      mobilityFocus: {
        type: [String],
        default: [],
      },
      conditioningFocus: {
        type: [String],
        default: [],
      },
      recommendedFocus: {
        type: [String],
        default: [],
      },
      beginnerActions: {
        type: [String],
        default: [],
      },
      confidence: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
      },
      disclaimer: {
        type: String,
        default:
          'This AI physique analysis is for general fitness, posture, and wellness guidance only. It is not medical advice, a clinical diagnosis, or a measurement of exact body composition.',
      },
    },
    geminiModel: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed',
      index: true,
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const PhysiqueAnalysis = mongoose.model('PhysiqueAnalysis', physiqueAnalysisSchema);

export default PhysiqueAnalysis;
export { PhysiqueAnalysis };
