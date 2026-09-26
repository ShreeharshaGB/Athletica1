import AnalyzedMeal from '../models/AnalyzedMeal.js';
import FitnessAssessment from '../models/FitnessAssessment.js';
import PhysiqueAnalysis from '../models/PhysiqueAnalysis.js';
import StudentProfile from '../models/StudentProfile.js';
import WorkoutPlan from '../models/WorkoutPlan.js';
import DietPlan from '../models/DietPlan.js';
import { answerCoachMessage } from '../services/geminiService.js';

export async function chatWithCoach(req, res) {
  try {
    const { message, history } = req.body || {};

    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'Please enter a fitness or nutrition question.' });
    }

    if (message.length > 2000) {
      return res.status(400).json({ message: 'Please keep your question under 2,000 characters.' });
    }

    const userId = req.user.id;
    const [profile, assessment, activePlan, activeDiet, recentMeals, physique] = await Promise.all([
      StudentProfile.findOne({ userId }).lean(),
      FitnessAssessment.findOne({ userId }).sort({ assessmentDate: -1 }).lean(),
      WorkoutPlan.findOne({ userId, status: 'active' }).sort({ updatedAt: -1 }).lean(),
      DietPlan.findOne({ userId, status: 'active' }).sort({ updatedAt: -1 }).lean(),
      AnalyzedMeal.find({ userId }).sort({ analyzedAt: -1 }).limit(5).lean(),
      PhysiqueAnalysis.findOne({ userId, status: 'completed' }).sort({ createdAt: -1 }).lean(),
    ]);

    const context = {
      profile: profile
        ? {
            age: profile.age,
            gender: profile.gender,
            heightCm: profile.height,
            weightKg: profile.weight,
            location: profile.location,
            fitnessGoal: profile.fitnessGoal,
            activityLevel: profile.activityLevel,
            dietPreference: profile.dietPreference,
          }
        : null,
      latestAssessment: assessment
        ? {
            overallScore: assessment.overallScore,
            fitnessLevel: assessment.fitnessLevel,
            pushUps: assessment.pushUps,
            sitUps: assessment.sitUps,
            runTime: assessment.runTime,
            flexibility: assessment.flexibility,
          }
        : null,
      activeWorkoutPlan: activePlan
        ? {
            goal: activePlan.goal,
            fitnessLevel: activePlan.fitnessLevel,
            availableTimeMinutes: activePlan.availableTimeMinutes,
            weeklyCompletionPercentage: activePlan.weeklyCompletionPercentage,
            workouts: activePlan.workouts?.map((workout) => ({
              dayOfWeek: workout.dayOfWeek,
              title: workout.title,
              durationMinutes: workout.durationMinutes,
              focus: workout.focus,
              exercises: workout.exercises?.slice(0, 8).map((exercise) => ({
                name: exercise.name,
                sets: exercise.sets,
                reps: exercise.reps,
                isCompleted: exercise.isCompleted,
              })),
            })),
          }
        : null,
      activeDietPlan: activeDiet
        ? {
            name: activeDiet.name,
            goal: activeDiet.goal,
            dietPreference: activeDiet.dietPreference,
            restrictions: activeDiet.restrictions,
            allergies: activeDiet.allergies,
            meals: activeDiet.meals,
          }
        : null,
      recentMeals: recentMeals.map((meal) => ({
        mealType: meal.mealType,
        foods: meal.foods?.map((food) => food.name),
        calories: meal.totalEstimatedCalories,
        proteinGrams: meal.totalProteinGrams,
        carbsGrams: meal.totalCarbsGrams,
        fatGrams: meal.totalFatGrams,
        analyzedAt: meal.analyzedAt,
      })),
      latestPhysiqueGuidance: physique?.analysis
        ? {
            summary: physique.analysis.summary,
            recommendedFocus: physique.analysis.recommendedFocus,
            beginnerActions: physique.analysis.beginnerActions,
            confidence: physique.analysis.confidence,
          }
        : null,
    };

    const reply = await answerCoachMessage({
      message,
      history: Array.isArray(history) ? history : [],
      studentContext: context,
    });

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Coach chat error:', error);
    return res.status(502).json({
      message: error.message || 'The coaching service is temporarily unavailable. Please try again.',
    });
  }
}