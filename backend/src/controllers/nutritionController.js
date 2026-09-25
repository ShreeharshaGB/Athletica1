import path from 'path';
import AnalyzedMeal from '../models/AnalyzedMeal.js';
import StudentProfile from '../models/StudentProfile.js';
import { saveImageToDisk, readImageFromDisk } from '../middleware/uploadMiddleware.js';
import { analyzeFoodImage, analyzeFoodText, getGeminiModel } from '../services/geminiService.js';

/**
 * Determines meal category based on current hour of the day.
 */
function determineMealType() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'Breakfast';
  if (hour >= 11 && hour < 16) return 'Lunch';
  if (hour >= 16 && hour < 19) return 'Snack';
  if (hour >= 19 && hour <= 23) return 'Dinner';
  return 'Fuel';
}

/**
 * POST /api/student/nutrition/analyze
 * Analyzes an uploaded food photo using Gemini multimodal vision.
 */
export async function analyzeFood(req, res) {
  try {
    const studentId = req.user.id;

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        message: 'Food image is required. Please upload a JPG, PNG, or WEBP photo of your meal.',
      });
    }

    // Optional student context
    let studentContext = {};
    try {
      const profile = await StudentProfile.findOne({ userId: studentId }).lean();
      if (profile) {
        studentContext.dietPreference = profile.dietPreference;
        studentContext.fitnessGoal = profile.fitnessGoal;
      }
    } catch (ctxErr) {
      console.warn('Could not load student profile context for nutrition analysis:', ctxErr.message);
    }

    // Securely save image to uploads/food
    const ext = path.extname(req.file.originalname) || '.jpg';
    let storageKey = null;
    try {
      storageKey = await saveImageToDisk(req.file.buffer, 'food', ext);
    } catch (diskErr) {
      console.error('Failed to save food image on disk:', diskErr);
      // Non-fatal if disk write fails, we can still proceed with analysis
    }

    // Perform multimodal analysis with Gemini
    let result;
    try {
      result = await analyzeFoodImage({
        imageBuffer: req.file.buffer,
        mimeType: req.file.mimetype,
        studentContext,
      });
    } catch (aiErr) {
      console.error('Food analysis error:', aiErr.message);
      return res.status(502).json({
        message: aiErr.message || 'AI food scanning service is temporarily unavailable. Please retry.',
      });
    }

    // If food could not be identified with confidence, do not save invalid meal to database
    if (!result.isIdentified || result.foods.length === 0) {
      return res.status(200).json({
        message: result.unidentifiedReason || 'Food could not be identified confidently. Try a clearer image.',
        isIdentified: false,
        analysis: result,
      });
    }

    // Save successful meal analysis
    const meal = await AnalyzedMeal.create({
      userId: studentId,
      imageStorageKey: storageKey,
      foods: result.foods,
      totalEstimatedCalories: result.totalEstimatedCalories,
      totalProteinGrams: result.totalProteinGrams,
      totalCarbsGrams: result.totalCarbsGrams,
      totalFatGrams: result.totalFatGrams,
      summary: result.summary,
      confidence: result.confidence,
      mealType: determineMealType(),
      analyzedAt: new Date(),
    });

    return res.status(201).json({
      message: 'Meal analyzed and logged successfully',
      isIdentified: true,
      meal: {
        id: meal._id,
        imageUrl: meal.imageStorageKey ? `/api/student/nutrition/image/${meal._id}` : null,
        foods: meal.foods,
        totalEstimatedCalories: meal.totalEstimatedCalories,
        totalProteinGrams: meal.totalProteinGrams,
        totalCarbsGrams: meal.totalCarbsGrams,
        totalFatGrams: meal.totalFatGrams,
        summary: meal.summary,
        confidence: meal.confidence,
        mealType: meal.mealType,
        analyzedAt: meal.analyzedAt,
      },
    });
  } catch (error) {
    console.error('Error in analyzeFood controller:', error);
    return res.status(500).json({
      message: 'Server error while analyzing meal photograph.',
    });
  }
}

/**
 * GET /api/student/nutrition/meals
 * Returns the authenticated student's previously analyzed meals history.
 */
export async function getRecentMeals(req, res) {
  try {
    const studentId = req.user.id;

    const meals = await AnalyzedMeal.find({ userId: studentId })
      .sort({ analyzedAt: -1 })
      .limit(20)
      .lean();

    const formattedMeals = meals.map((m) => ({
      id: m._id,
      imageUrl: m.imageStorageKey ? `/api/student/nutrition/image/${m._id}` : null,
      foods: m.foods,
      totalEstimatedCalories: m.totalEstimatedCalories,
      totalProteinGrams: m.totalProteinGrams,
      totalCarbsGrams: m.totalCarbsGrams,
      totalFatGrams: m.totalFatGrams,
      summary: m.summary,
      confidence: m.confidence,
      mealType: m.mealType,
      analyzedAt: m.analyzedAt,
    }));

    return res.status(200).json({
      meals: formattedMeals,
      total: formattedMeals.length,
    });
  } catch (error) {
    console.error('Error fetching recent meals:', error);
    return res.status(500).json({
      message: 'Server error while fetching meal history.',
    });
  }
}

/**
 * GET /api/student/nutrition/today
 * Computes today's total calories, macros, and logged meals for the authenticated student.
 */
export async function getTodayNutrition(req, res) {
  try {
    const studentId = req.user.id;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    const mealsToday = await AnalyzedMeal.find({
      userId: studentId,
      analyzedAt: { $gte: startOfDay },
    })
      .sort({ analyzedAt: -1 })
      .lean();

    const totals = mealsToday.reduce(
      (acc, m) => ({
        calories: acc.calories + m.totalEstimatedCalories,
        protein: acc.protein + m.totalProteinGrams,
        carbs: acc.carbs + m.totalCarbsGrams,
        fat: acc.fat + m.totalFatGrams,
        mealsCount: acc.mealsCount + 1,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, mealsCount: 0 }
    );

    const formattedMeals = mealsToday.map((m) => ({
      id: m._id,
      imageUrl: m.imageStorageKey ? `/api/student/nutrition/image/${m._id}` : null,
      foods: m.foods,
      totalEstimatedCalories: m.totalEstimatedCalories,
      totalProteinGrams: m.totalProteinGrams,
      totalCarbsGrams: m.totalCarbsGrams,
      totalFatGrams: m.totalFatGrams,
      summary: m.summary,
      confidence: m.confidence,
      mealType: m.mealType,
      analyzedAt: m.analyzedAt,
    }));

    return res.status(200).json({
      totals,
      mealsToday: formattedMeals,
    });
  } catch (error) {
    console.error('Error fetching today nutrition:', error);
    return res.status(500).json({
      message: 'Server error while computing daily nutrition totals.',
    });
  }
}

/**
 * GET /api/student/nutrition/image/:id
 * Streams the meal photo securely. Only the owning student can access it.
 */
export async function getMealImage(req, res) {
  try {
    const studentId = req.user.id;
    const mealId = req.params.id;

    const meal = await AnalyzedMeal.findOne({
      _id: mealId,
      userId: studentId,
    }).lean();

    if (!meal || !meal.imageStorageKey) {
      return res.status(404).json({
        message: 'Meal image not found or access denied.',
      });
    }

    const imageBuffer = await readImageFromDisk(meal.imageStorageKey);
    if (!imageBuffer) {
      return res.status(404).json({
        message: 'Image file no longer exists in storage.',
      });
    }

    const ext = path.extname(meal.imageStorageKey).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
    };
    const contentType = mimeTypes[ext] || 'image/jpeg';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'private, max-age=86400');
    return res.send(imageBuffer);
  } catch (error) {
    console.error('Error retrieving meal image:', error);
    return res.status(500).json({
      message: 'Server error while reading meal image.',
    });
  }
}

/**
 * POST /api/student/nutrition/describe
 * Analyzes a written food description using Gemini and logs the meal.
 */
export async function describeFood(req, res) {
  try {
    const studentId = req.user.id;
    const { description } = req.body;

    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({
        message: 'Please provide a text description of your meal (e.g., "2 neer dosa with coconut chutney").',
      });
    }

    let studentContext = {};
    try {
      const profile = await StudentProfile.findOne({ userId: studentId }).lean();
      if (profile) {
        studentContext.dietPreference = profile.dietPreference;
        studentContext.fitnessGoal = profile.fitnessGoal;
      }
    } catch (ctxErr) {
      console.warn('Could not load student profile context for food description:', ctxErr.message);
    }

    let result;
    try {
      result = await analyzeFoodText({
        description: description.trim(),
        studentContext,
      });
    } catch (aiErr) {
      console.error('Food description analysis error:', aiErr.message);
      return res.status(502).json({
        message: aiErr.message || 'AI food description service is temporarily unavailable. Please retry.',
      });
    }

    if (!result.isIdentified || result.foods.length === 0) {
      return res.status(200).json({
        message:
          result.unidentifiedReason ||
          'Food could not be identified confidently from description. Try adding specific dish and portion details.',
        isIdentified: false,
        analysis: result,
      });
    }

    // Save successful meal analysis
    const meal = await AnalyzedMeal.create({
      userId: studentId,
      imageStorageKey: null,
      foods: result.foods,
      totalEstimatedCalories: result.totalEstimatedCalories,
      totalProteinGrams: result.totalProteinGrams,
      totalCarbsGrams: result.totalCarbsGrams,
      totalFatGrams: result.totalFatGrams,
      summary: result.summary,
      confidence: result.confidence,
      mealType: determineMealType(),
      analyzedAt: new Date(),
    });

    return res.status(201).json({
      message: 'Meal analyzed and logged successfully from description',
      isIdentified: true,
      meal: {
        id: meal._id,
        imageUrl: null,
        foods: meal.foods,
        totalEstimatedCalories: meal.totalEstimatedCalories,
        totalProteinGrams: meal.totalProteinGrams,
        totalCarbsGrams: meal.totalCarbsGrams,
        totalFatGrams: meal.totalFatGrams,
        summary: meal.summary,
        confidence: meal.confidence,
        mealType: meal.mealType,
        analyzedAt: meal.analyzedAt,
      },
    });
  } catch (error) {
    console.error('Error in describeFood controller:', error);
    return res.status(500).json({
      message: 'Server error while analyzing meal description.',
    });
  }
}

/**
 * POST /api/student/nutrition/log-curated
 * Directly logs a meal selected from the curated Indian regional food dataset.
 * Does NOT call Gemini.
 */
export async function logCuratedMeal(req, res) {
  try {
    const studentId = req.user.id;
    const {
      name,
      estimatedPortion,
      servings = 1,
      nutrition,
      region,
    } = req.body;

    if (!name || !nutrition) {
      return res.status(400).json({
        message: 'Food name and nutrition information are required to log a curated meal.',
      });
    }

    const qty = Math.max(0.5, Math.min(10, Number(servings) || 1));
    const portionStr =
      qty === 1
        ? estimatedPortion || '1 serving'
        : `${qty}x (${estimatedPortion || '1 serving'})`;

    const singleCals = Math.max(0, Number(nutrition.calories) || 0);
    const singleProtein = Math.max(0, Number(nutrition.protein) || 0);
    const singleCarbs = Math.max(0, Number(nutrition.carbs) || 0);
    const singleFat = Math.max(0, Number(nutrition.fat) || 0);

    const totalCals = Math.round(singleCals * qty);
    const totalProtein = Math.round(singleProtein * qty);
    const totalCarbs = Math.round(singleCarbs * qty);
    const totalFat = Math.round(singleFat * qty);

    const meal = await AnalyzedMeal.create({
      userId: studentId,
      imageStorageKey: null,
      foods: [
        {
          name: name.trim(),
          estimatedPortion: portionStr,
          estimatedCalories: totalCals,
          proteinGrams: totalProtein,
          carbsGrams: totalCarbs,
          fatGrams: totalFat,
        },
      ],
      totalEstimatedCalories: totalCals,
      totalProteinGrams: totalProtein,
      totalCarbsGrams: totalCarbs,
      totalFatGrams: totalFat,
      summary: `Logged ${qty} serving(s) of ${name} (${region || 'Regional Indian'}). Verified nutritional profile from Athletica Curated Food Dataset.`,
      confidence: 'high',
      mealType: determineMealType(),
      analyzedAt: new Date(),
    });

    return res.status(201).json({
      message: `${name} added to today's meals successfully!`,
      isIdentified: true,
      meal: {
        id: meal._id,
        imageUrl: null,
        foods: meal.foods,
        totalEstimatedCalories: meal.totalEstimatedCalories,
        totalProteinGrams: meal.totalProteinGrams,
        totalCarbsGrams: meal.totalCarbsGrams,
        totalFatGrams: meal.totalFatGrams,
        summary: meal.summary,
        confidence: meal.confidence,
        mealType: meal.mealType,
        analyzedAt: meal.analyzedAt,
      },
    });
  } catch (error) {
    console.error('Error in logCuratedMeal controller:', error);
    return res.status(500).json({
      message: 'Server error while logging curated meal.',
    });
  }
}

