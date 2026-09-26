import { GoogleGenAI } from '@google/genai';

let cachedClient = null;

/**
 * Returns a configured GoogleGenAI instance.
 * Throws a clean error if the API key is not configured.
 */
export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
    throw new Error('GEMINI_API_KEY is not configured in backend environment variables.');
  }

  if (!cachedClient) {
    cachedClient = new GoogleGenAI({ apiKey: apiKey.trim() });
  }

  return cachedClient;
}

/**
 * Returns the configured Gemini model name without hardcoding.
 */
export function getGeminiModel() {
  const model = process.env.GEMINI_MODEL;
  if (!model || typeof model !== 'string' || !model.trim()) {
    return 'gemini-3.8-flash';
  }
  return model.trim();
}

/**
 * Schema for structured Physique Analysis response
 */
export const physiqueAnalysisResponseSchema = {
  type: 'OBJECT',
  properties: {
    isSuitableImage: {
      type: 'BOOLEAN',
      description:
        'True if the image is a clear, unobstructed, suitable photograph of a human physique or posture. False if blurry, obstructed, dark, non-human, or inappropriate.',
    },
    unsuitableReason: {
      type: 'STRING',
      description:
        'If isSuitableImage is false, provide a polite, actionable explanation asking for a clearer physique photo. Empty string if suitable.',
    },
    summary: {
      type: 'STRING',
      description:
        'A constructive, fitness-oriented overview of visible alignment, kinetic posture, and athletic foundation.',
    },
    visibleObservations: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description:
        'List of visible posture and alignment observations relevant to functional exercise and fitness.',
    },
    strengthFocus: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description:
        'Specific muscle groups or movement patterns that would benefit from targeted strength and resistance training.',
    },
    mobilityFocus: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description:
        'Key flexibility, mobility, and thoracic/hip/ankle mobility areas to prioritize.',
    },
    conditioningFocus: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description:
        'Cardiorespiratory and muscular endurance conditioning recommendations.',
    },
    recommendedFocus: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description:
        'Top 3-4 overarching athletic and training priorities.',
    },
    beginnerActions: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description:
        'Safe, practical, immediate exercises and lifestyle action steps the athlete can incorporate today.',
    },
    confidence: {
      type: 'STRING',
      description: 'Confidence level of the visual assessment: low, medium, or high.',
    },
    disclaimer: {
      type: 'STRING',
      description:
        'Legal and medical disclaimer explicitly stating non-diagnostic nature.',
    },
  },
  required: [
    'isSuitableImage',
    'unsuitableReason',
    'summary',
    'visibleObservations',
    'strengthFocus',
    'mobilityFocus',
    'conditioningFocus',
    'recommendedFocus',
    'beginnerActions',
    'confidence',
    'disclaimer',
  ],
};

/**
 * Multimodal analysis of a student's physique image.
 */
export async function analyzePhysiqueImage({ imageBuffer, mimeType, studentContext = {} }) {
  const ai = getGeminiClient();
  const model = getGeminiModel();

  const base64Data = imageBuffer.toString('base64');

  // Build supplementary context from verified profile without allowing overwrite
  let contextPrompt = '';
  if (studentContext.fitnessGoal || studentContext.activityLevel || studentContext.fitnessLevel) {
    contextPrompt = `
Athletic profile context provided by student (for supplementary personalization only):
- Primary Fitness Goal: ${studentContext.fitnessGoal || 'General Fitness & Health'}
- Activity Level: ${studentContext.activityLevel || 'Not specified'}
- Assessment Tier: ${studentContext.fitnessLevel || 'Active'}
`;
  }

  const promptText = `
You are an expert, supportive athletic conditioning and posture specialist for Athletica.
Analyze the attached physique photograph to provide personalized, structured fitness and movement guidance.

CRITICAL GUARDRAILS & NON-MEDICAL DIRECTIVES:
1. Non-Medical: You must NEVER diagnose medical conditions, spinal pathologies, injuries, hormone levels, or internal health.
2. No Speculative Numbers: Do NOT attempt to measure or guess exact body fat percentage, exact muscle mass in kilograms, or exact BMI from the photograph.
3. Visual Relevance: Focus exclusively on visible posture, shoulder/hip symmetry, physical frame alignment, and general muscular conditioning appropriate for physical education.
4. Image Suitability Check: If the photo is not of a human, or is too blurry, dark, heavily occluded, or completely unsuitable for posture/physique evaluation, set "isSuitableImage": false and state the reason in "unsuitableReason". Do NOT fabricate findings on unreadable images.
5. Tone: Encouraging, objective, growth-oriented, and empowering for student athletes.

${contextPrompt}

Respond strictly using the required JSON schema.
`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType,
          },
        },
        promptText,
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: physiqueAnalysisResponseSchema,
        temperature: 0.2,
      },
    });

    if (!response || !response.text) {
      throw new Error('Gemini API returned an empty response.');
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(response.text);
    } catch (parseErr) {
      console.error('Failed to parse Gemini structured JSON output:', response.text);
      throw new Error('Invalid JSON format returned by Gemini.');
    }

    // Validate fields and normalize
    return normalizePhysiqueAnalysis(parsedResult);
  } catch (error) {
    console.error(`Gemini API Error with model [${model}]:`, error);
    // Preserve model name error details without leaking internal secret keys
    throw new Error(`Gemini analysis error: ${error.message || 'Service unavailable'}`);
  }
}

/**
 * Normalizes and guarantees complete field structure of the analysis result.
 */
function normalizePhysiqueAnalysis(raw) {
  const isSuitable = Boolean(raw.isSuitableImage);

  return {
    isSuitableImage: isSuitable,
    unsuitableReason: isSuitable
      ? ''
      : String(raw.unsuitableReason || 'The uploaded photo was not clear enough for physique analysis. Please try again with a clear, well-lit photo.').trim(),
    summary: String(raw.summary || '').trim(),
    visibleObservations: Array.isArray(raw.visibleObservations)
      ? raw.visibleObservations.map((s) => String(s).trim()).filter(Boolean)
      : [],
    strengthFocus: Array.isArray(raw.strengthFocus)
      ? raw.strengthFocus.map((s) => String(s).trim()).filter(Boolean)
      : [],
    mobilityFocus: Array.isArray(raw.mobilityFocus)
      ? raw.mobilityFocus.map((s) => String(s).trim()).filter(Boolean)
      : [],
    conditioningFocus: Array.isArray(raw.conditioningFocus)
      ? raw.conditioningFocus.map((s) => String(s).trim()).filter(Boolean)
      : [],
    recommendedFocus: Array.isArray(raw.recommendedFocus)
      ? raw.recommendedFocus.map((s) => String(s).trim()).filter(Boolean)
      : [],
    beginnerActions: Array.isArray(raw.beginnerActions)
      ? raw.beginnerActions.map((s) => String(s).trim()).filter(Boolean)
      : [],
    confidence: ['low', 'medium', 'high'].includes(String(raw.confidence).toLowerCase())
      ? String(raw.confidence).toLowerCase()
      : 'medium',
    disclaimer:
      String(raw.disclaimer || '').trim() ||
      'This AI physique analysis is for general fitness and wellness guidance only. It is not medical advice, a diagnosis, or a measurement of exact body composition.',
  };
}

/**
 * Schema for structured AI Food Scanner response
 */
export const foodAnalysisResponseSchema = {
  type: 'OBJECT',
  properties: {
    isIdentified: {
      type: 'BOOLEAN',
      description:
        'True if food or drink items are identifiable in the photograph. False if the image is non-food, blurry, or food cannot be recognized.',
    },
    unidentifiedReason: {
      type: 'STRING',
      description:
        'If isIdentified is false, provide a concise explanation such as "Food could not be identified confidently. Try a clearer image." Empty string if food is identified.',
    },
    foods: {
      type: 'ARRAY',
      description: 'List of individual food or beverage dishes detected in the meal.',
      items: {
        type: 'OBJECT',
        properties: {
          name: {
            type: 'STRING',
            description: 'Name of the dish or food item (e.g. Neer Dosa, Chicken Curry, Steamed Rice, Dal Tadka).',
          },
          estimatedPortion: {
            type: 'STRING',
            description: 'Estimated portion size based on visual plate reference (e.g. 2 pieces, 1 cup, 150g).',
          },
          estimatedCalories: {
            type: 'INTEGER',
            description: 'Estimated calories in kcal.',
          },
          proteinGrams: {
            type: 'INTEGER',
            description: 'Estimated protein content in grams.',
          },
          carbsGrams: {
            type: 'INTEGER',
            description: 'Estimated carbohydrates in grams.',
          },
          fatGrams: {
            type: 'INTEGER',
            description: 'Estimated dietary fat in grams.',
          },
        },
        required: [
          'name',
          'estimatedPortion',
          'estimatedCalories',
          'proteinGrams',
          'carbsGrams',
          'fatGrams',
        ],
      },
    },
    totalEstimatedCalories: {
      type: 'INTEGER',
      description: 'Sum of estimated calories across all detected foods in the meal.',
    },
    totalProteinGrams: {
      type: 'INTEGER',
      description: 'Sum of estimated protein grams.',
    },
    totalCarbsGrams: {
      type: 'INTEGER',
      description: 'Sum of estimated carbohydrates grams.',
    },
    totalFatGrams: {
      type: 'INTEGER',
      description: 'Sum of estimated fat grams.',
    },
    summary: {
      type: 'STRING',
      description: 'A 1-2 sentence nutritional evaluation of macronutrient balance and athletic energy support.',
    },
    confidence: {
      type: 'STRING',
      description: 'Visual confidence: low, medium, or high.',
    },
  },
  required: [
    'isIdentified',
    'unidentifiedReason',
    'foods',
    'totalEstimatedCalories',
    'totalProteinGrams',
    'totalCarbsGrams',
    'totalFatGrams',
    'summary',
    'confidence',
  ],
};

/**
 * Retries a promise-based operation for transient 503 errors with exponential backoff.
 */
async function callGeminiWithRetry(fn, maxRetries = 2, baseDelayMs = 1000) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const is503 =
        err?.status === 503 ||
        err?.message?.includes('503') ||
        err?.message?.includes('high demand') ||
        err?.message?.includes('UNAVAILABLE');

      if (is503 && attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        console.warn(
          `Gemini 503 temporarily unavailable, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

/**
 * Multimodal analysis of a food photo for macronutrient and calorie estimation.
 */
export async function analyzeFoodImage({ imageBuffer, mimeType, studentContext = {} }) {
  const ai = getGeminiClient();
  const model = getGeminiModel();

  const base64Data = imageBuffer.toString('base64');

  let profileContext = '';
  if (studentContext.dietPreference || studentContext.fitnessGoal) {
    profileContext = `
Student dietary context:
- Diet Preference: ${studentContext.dietPreference || 'Not specified'}
- Athletic Goal: ${studentContext.fitnessGoal || 'General Fitness'}
`;
  }

  const promptText = `
You are an expert sports nutritionist and culinary specialist with comprehensive knowledge of global cuisines and diverse Indian regional cooking (South, North, West, East, Northeast, and Coastal India).
Analyze the attached meal photo to identify the food items and estimate macronutrients and total calories.

CRITICAL GUARDRAILS & ACCURACY GUIDELINES:
1. ESTIMATION DISCLOSURE: All calorie and macronutrient values from photographs are visual estimates.
2. DISH IDENTIFICATION: Recognize traditional Indian regional dishes accurately (e.g., Neer Dosa, Pesarattu, Dalma, Thepla, Dhokla, Pakhala, Makki di Roti, Kori Gassi, Upma, Poha, Khichdi, Biryani, Roti, Dal, Paneer, Curd, etc.).
3. UNCLEAR OR NON-FOOD IMAGES: If the photograph does not show food or drink, or is too blurry, dark, or distorted to identify with reasonable confidence, set "isIdentified": false and "unidentifiedReason": "Food could not be identified confidently. Try a clearer image." Set "foods": [], and totals to 0. Do NOT fabricate numbers for unidentifiable images.
4. MACRO REASONABLENESS: Ensure estimated portions and macro grams are physiologically realistic for athletic fueling.
5. NON-MEDICAL: Do not diagnose medical conditions or prescribe therapeutic diets.

${profileContext}

Respond strictly using the required JSON schema.
`;

  try {
    const response = await callGeminiWithRetry(async () => {
      return ai.models.generateContent({
        model,
        contents: [
          {
            inlineData: {
              data: base64Data,
              mimeType,
            },
          },
          promptText,
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: foodAnalysisResponseSchema,
          temperature: 0.2,
        },
      });
    });

    if (!response || !response.text) {
      throw new Error('Gemini API returned an empty response.');
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(response.text);
    } catch (parseErr) {
      console.error('Failed to parse Gemini food output:', response.text);
      throw new Error('Invalid JSON format returned by Gemini.');
    }

    return normalizeFoodAnalysis(parsedResult);
  } catch (error) {
    console.error(`Gemini Food Analysis Error [${model}]:`, error);
    throw new Error(`Gemini analysis error: ${error.message || 'Service unavailable'}`);
  }
}

/**
 * Normalizes food analysis output and guarantees integrity of all macro values.
 */
function normalizeFoodAnalysis(raw) {
  const isIdentified = Boolean(raw.isIdentified);

  if (!isIdentified) {
    return {
      isIdentified: false,
      unidentifiedReason:
        String(raw.unidentifiedReason || 'Food could not be identified confidently. Try a clearer image.').trim(),
      foods: [],
      totalEstimatedCalories: 0,
      totalProteinGrams: 0,
      totalCarbsGrams: 0,
      totalFatGrams: 0,
      summary: 'No identifiable food items detected.',
      confidence: 'low',
    };
  }

  const rawFoods = Array.isArray(raw.foods) ? raw.foods : [];
  const foods = rawFoods
    .map((item) => ({
      name: String(item.name || 'Food item').trim(),
      estimatedPortion: String(item.estimatedPortion || '1 serving').trim(),
      estimatedCalories: Math.max(0, Math.round(Number(item.estimatedCalories) || 0)),
      proteinGrams: Math.max(0, Math.round(Number(item.proteinGrams) || 0)),
      carbsGrams: Math.max(0, Math.round(Number(item.carbsGrams) || 0)),
      fatGrams: Math.max(0, Math.round(Number(item.fatGrams) || 0)),
    }))
    .filter((item) => item.name);

  // Re-sum if Gemini totals are inconsistent
  const calculatedCals = foods.reduce((acc, f) => acc + f.estimatedCalories, 0);
  const calculatedProtein = foods.reduce((acc, f) => acc + f.proteinGrams, 0);
  const calculatedCarbs = foods.reduce((acc, f) => acc + f.carbsGrams, 0);
  const calculatedFat = foods.reduce((acc, f) => acc + f.fatGrams, 0);

  const totalEstimatedCalories =
    Number(raw.totalEstimatedCalories) > 0 ? Number(raw.totalEstimatedCalories) : calculatedCals;
  const totalProteinGrams =
    Number(raw.totalProteinGrams) > 0 ? Number(raw.totalProteinGrams) : calculatedProtein;
  const totalCarbsGrams =
    Number(raw.totalCarbsGrams) > 0 ? Number(raw.totalCarbsGrams) : calculatedCarbs;
  const totalFatGrams =
    Number(raw.totalFatGrams) > 0 ? Number(raw.totalFatGrams) : calculatedFat;

  return {
    isIdentified: foods.length > 0,
    unidentifiedReason: foods.length > 0 ? '' : 'No dishes could be confidently recognized.',
    foods,
    totalEstimatedCalories: Math.round(totalEstimatedCalories),
    totalProteinGrams: Math.round(totalProteinGrams),
    totalCarbsGrams: Math.round(totalCarbsGrams),
    totalFatGrams: Math.round(totalFatGrams),
    summary: String(raw.summary || 'Estimated nutritional breakdown based on visual plate components.').trim(),
    confidence: ['low', 'medium', 'high'].includes(String(raw.confidence).toLowerCase())
      ? String(raw.confidence).toLowerCase()
      : 'medium',
  };
}

/**
 * Text-based analysis of a food description for macronutrient and calorie estimation.
 */
export async function analyzeFoodText({ description, studentContext = {} }) {
  const ai = getGeminiClient();
  const model = getGeminiModel();

  if (!description || typeof description !== 'string' || !description.trim()) {
    throw new Error('Meal description text is required.');
  }

  let profileContext = '';
  if (studentContext.dietPreference || studentContext.fitnessGoal) {
    profileContext = `
Student dietary context:
- Diet Preference: ${studentContext.dietPreference || 'Not specified'}
- Athletic Goal: ${studentContext.fitnessGoal || 'General Fitness'}
`;
  }

  const promptText = `
You are an expert sports nutritionist and culinary specialist with comprehensive knowledge of global cuisines and diverse Indian regional cooking (South, North, West, East, Northeast, and Coastal India).
The student has described what they ate:
"${description.trim()}"

Analyze this meal description to identify the individual food items, estimate portion sizes, and calculate macronutrients (protein, carbs, fat) and total calories.

CRITICAL GUARDRAILS & ACCURACY GUIDELINES:
1. ESTIMATION DISCLOSURE: All calorie and macronutrient values from descriptions are estimates.
2. DISH IDENTIFICATION: Recognize traditional Indian regional dishes accurately (e.g. Neer Dosa, Pesarattu, Dalma, Thepla, Dhokla, Pakhala, Makki di Roti, Kori Gassi, Upma, Poha, Khichdi, Biryani, Roti, Dal, Paneer, Curd, etc.).
3. UNCLEAR OR NONSENSE DESCRIPTIONS: If the text does not describe edible food or drink, or is too vague to estimate (e.g. "something", "xyz123"), set "isIdentified": false and "unidentifiedReason": "Food description could not be understood confidently. Please describe what you ate with portion details (e.g. '2 rotis and 1 bowl dal')." Set "foods": [], and totals to 0. Do NOT fabricate numbers for unidentifiable descriptions.
4. MACRO REASONABLENESS: Ensure estimated portions and macro grams are physiologically realistic for athletic fueling.
5. NON-MEDICAL: Do not diagnose medical conditions or prescribe therapeutic diets.

${profileContext}

Respond strictly using the required JSON schema.
`;

  try {
    const response = await callGeminiWithRetry(async () => {
      return ai.models.generateContent({
        model,
        contents: [promptText],
        config: {
          responseMimeType: 'application/json',
          responseSchema: foodAnalysisResponseSchema,
          temperature: 0.2,
        },
      });
    });

    if (!response || !response.text) {
      throw new Error('Gemini API returned an empty response.');
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(response.text);
    } catch (parseErr) {
      console.error('Failed to parse Gemini food text output:', response.text);
      throw new Error('Invalid JSON format returned by Gemini.');
    }

    return normalizeFoodAnalysis(parsedResult);
  } catch (error) {
    console.error(`Gemini Food Text Analysis Error [${model}]:`, error);
    throw new Error(`Gemini analysis error: ${error.message || 'Service unavailable'}`);
  }
}

/**
 * Answers a student's fitness or nutrition question using their verified app context.
 */
export async function answerCoachMessage({ message, history = [], studentContext = {} }) {
  const ai = getGeminiClient();
  const model = getGeminiModel();

  if (!message || typeof message !== 'string' || !message.trim()) {
    throw new Error('Coach message is required.');
  }

  const safeHistory = Array.isArray(history)
    ? history
        .filter((item) => item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string')
        .slice(-8)
        .map((item) => `${item.role === 'user' ? 'Student' : 'Coach'}: ${item.content.trim().slice(0, 1200)}`)
        .join('\n')
    : '';

  const profileContext = JSON.stringify(studentContext, null, 2);
  const promptText = `
You are Athletica Coach, a supportive fitness and sports-nutrition assistant for people with different bodies, goals, abilities, environments, and training backgrounds.
Answer the student's latest message with practical, personalized guidance using only the verified context below.
For food guidance, prioritize practical Indian meals and regional variety when appropriate (rice, roti, millets, dals, beans, paneer, curd, eggs, fish, chicken, vegetables, and regional dishes). Respect every listed diet preference, restriction, and allergy; never suggest a listed allergen as a substitute.

WORKOUT DESIGN MODE:
When the student asks for a workout, routine, training plan, or exercise substitutions, design the session around the constraints in their message and profile. Support all of these modes:
- Competitive athletes: sport performance, power, speed, agility, conditioning, and recovery. Ask for the sport and season when relevant.
- Gym access: barbells, dumbbells, machines, cables, or a limited gym. Name the equipment needed.
- Home or no equipment: bodyweight, a wall, chair, stairs, backpack, or floor space. Never assume equipment.
- Calisthenics: scalable push, pull, squat, hinge, core, balance, and skill progressions. Offer regressions and progressions.
- Yoga and mobility: breath-led mobility, flexibility, balance, stability, and recovery flows. Do not present yoga as a cure for medical conditions.
- Beginners, older adults, deconditioned people, and people returning to movement: lower impact, slower pace, clear form cues, and conservative volume.
- Mixed preferences: combine strength, cardio, mobility, yoga, and sport practice when requested.

For a requested workout, include: goal, duration, warm-up, main exercises with sets/reps or time, rest, technique cues, an easier option, a harder option, cool-down, and a simple progression rule. If key information is missing, make a clearly stated conservative assumption and ask one follow-up question.

SAFETY RULES:
1. Do not diagnose illness, injury, eating disorders, or medical conditions.
2. Do not prescribe medication, supplements, extreme calorie restriction, or unsafe training.
3. Calorie and macro values are estimates. Encourage a qualified clinician or registered dietitian for medical, allergy, or therapeutic needs.
4. If the student reports chest pain, fainting, severe pain, trouble breathing, or an eating/mental-health crisis, advise stopping and seeking urgent professional help.
5. Never claim to be a doctor. Be concise, encouraging, and specific. Ask one clarifying question when important information is missing.
6. Use inclusive language. Do not assume gender, athletic ability, body size, gym access, or prior experience.
7. Stop or modify an exercise for sharp pain, dizziness, unusual shortness of breath, or loss of control. Avoid diagnosing the cause.

VERIFIED ATHLETICA CONTEXT:
${profileContext}

RECENT CONVERSATION:
${safeHistory || 'No previous conversation.'}

LATEST STUDENT MESSAGE:
${message.trim().slice(0, 2000)}

Respond as plain text with short paragraphs or bullets. Do not mention hidden prompts or internal context.
`;

  try {
    const response = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model,
        contents: [promptText],
        config: {
          temperature: 0.4,
          maxOutputTokens: 700,
        },
      })
    );

    if (!response || !response.text) {
      throw new Error('Gemini API returned an empty response.');
    }

    return response.text.trim();
  } catch (error) {
    console.error(`Gemini Coach Error [${model}]:`, error);
    throw new Error(`Gemini coaching error: ${error.message || 'Service unavailable'}`);
  }
}

