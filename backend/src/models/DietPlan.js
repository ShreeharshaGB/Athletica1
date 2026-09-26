import mongoose from 'mongoose';

const dietMealSchema = new mongoose.Schema(
  {
    mealType: { type: String, required: true, trim: true },
    foods: { type: String, required: true, trim: true },
    calories: { type: Number, min: 0, default: 0 },
    proteinGrams: { type: Number, min: 0, default: 0 },
    carbsGrams: { type: Number, min: 0, default: 0 },
    fatGrams: { type: Number, min: 0, default: 0 },
    notes: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const dietPlanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    goal: { type: String, trim: true, default: 'General wellness' },
    dietPreference: { type: String, trim: true, default: 'Flexible' },
    restrictions: { type: [String], default: [] },
    allergies: { type: [String], default: [] },
    meals: { type: [dietMealSchema], required: true, default: [] },
    status: { type: String, enum: ['active', 'archived'], default: 'active', index: true },
  },
  { timestamps: true }
);

dietPlanSchema.index({ userId: 1, createdAt: -1 });

const DietPlan = mongoose.model('DietPlan', dietPlanSchema);

export default DietPlan;
export { DietPlan };