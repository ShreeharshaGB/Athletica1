import mongoose from 'mongoose';

const detectedFoodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    estimatedPortion: {
      type: String,
      default: '1 serving',
      trim: true,
    },
    estimatedCalories: {
      type: Number,
      default: 0,
      min: 0,
    },
    proteinGrams: {
      type: Number,
      default: 0,
      min: 0,
    },
    carbsGrams: {
      type: Number,
      default: 0,
      min: 0,
    },
    fatGrams: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const analyzedMealSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    imageStorageKey: {
      type: String,
      default: null,
    },
    foods: {
      type: [detectedFoodSchema],
      default: [],
    },
    totalEstimatedCalories: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalProteinGrams: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalCarbsGrams: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalFatGrams: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    summary: {
      type: String,
      default: '',
      trim: true,
    },
    confidence: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    mealType: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Fuel'],
      default: 'Fuel',
    },
    analyzedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying user's meals by date
analyzedMealSchema.index({ userId: 1, analyzedAt: -1 });

const AnalyzedMeal = mongoose.model('AnalyzedMeal', analyzedMealSchema);

export default AnalyzedMeal;
export { AnalyzedMeal };
