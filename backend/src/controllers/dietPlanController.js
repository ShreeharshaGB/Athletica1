import DietPlan from '../models/DietPlan.js';

function normalizeList(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean).slice(0, 20);
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean).slice(0, 20);
  return [];
}

function normalizeMeals(meals) {
  if (!Array.isArray(meals) || meals.length === 0) return null;
  return meals.slice(0, 12).map((meal) => ({
    mealType: String(meal.mealType || 'Meal').trim(),
    foods: String(meal.foods || '').trim(),
    calories: Math.max(0, Number(meal.calories) || 0),
    proteinGrams: Math.max(0, Number(meal.proteinGrams) || 0),
    carbsGrams: Math.max(0, Number(meal.carbsGrams) || 0),
    fatGrams: Math.max(0, Number(meal.fatGrams) || 0),
    notes: String(meal.notes || '').trim(),
  })).filter((meal) => meal.mealType && meal.foods);
}

function formatDietPlan(plan) {
  return {
    id: plan._id,
    name: plan.name,
    goal: plan.goal,
    dietPreference: plan.dietPreference,
    restrictions: plan.restrictions,
    allergies: plan.allergies,
    meals: plan.meals,
    status: plan.status,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  };
}

export async function createDietPlan(req, res) {
  try {
    const { name, goal, dietPreference, restrictions, allergies, meals } = req.body || {};
    const normalizedMeals = normalizeMeals(meals);
    if (typeof name !== 'string' || !name.trim()) return res.status(400).json({ message: 'Diet plan name is required.' });
    if (!normalizedMeals) return res.status(400).json({ message: 'Add at least one meal to your diet plan.' });

    await DietPlan.updateMany({ userId: req.user.id, status: 'active' }, { $set: { status: 'archived' } });
    const plan = await DietPlan.create({
      userId: req.user.id,
      name: name.trim(),
      goal: String(goal || 'General wellness').trim(),
      dietPreference: String(dietPreference || 'Flexible').trim(),
      restrictions: normalizeList(restrictions),
      allergies: normalizeList(allergies),
      meals: normalizedMeals,
      status: 'active',
    });

    return res.status(201).json({ message: 'Custom diet plan saved.', plan: formatDietPlan(plan) });
  } catch (error) {
    console.error('Create diet plan error:', error);
    return res.status(500).json({ message: 'Server error while saving diet plan.' });
  }
}

export async function getDietPlans(req, res) {
  try {
    const plans = await DietPlan.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ plans: plans.map(formatDietPlan) });
  } catch (error) {
    console.error('Get diet plans error:', error);
    return res.status(500).json({ message: 'Server error while loading diet plans.' });
  }
}

export async function getActiveDietPlan(req, res) {
  try {
    const plan = await DietPlan.findOne({ userId: req.user.id, status: 'active' }).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ plan: plan ? formatDietPlan(plan) : null });
  } catch (error) {
    console.error('Get active diet plan error:', error);
    return res.status(500).json({ message: 'Server error while loading active diet plan.' });
  }
}