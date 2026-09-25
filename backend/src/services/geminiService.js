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
