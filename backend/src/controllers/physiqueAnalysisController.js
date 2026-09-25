import path from 'path';
import PhysiqueAnalysis from '../models/PhysiqueAnalysis.js';
import StudentProfile from '../models/StudentProfile.js';
import FitnessAssessment from '../models/FitnessAssessment.js';
import { saveImageToDisk, readImageFromDisk } from '../middleware/uploadMiddleware.js';
import { analyzePhysiqueImage, getGeminiModel } from '../services/geminiService.js';

/**
 * POST /api/student/physique-analysis
 * Uploads and analyzes a student's physique image.
 */
export async function analyzePhysique(req, res) {
  try {
    const studentId = req.user.id;

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        message: 'Physique image is required. Please upload a JPG, PNG, or WEBP photo.',
      });
    }

    // Optional student context to enrich guidance
    let studentContext = {};
    try {
      const [profile, assessment] = await Promise.all([
        StudentProfile.findOne({ userId: studentId }).lean(),
        FitnessAssessment.findOne({ userId: studentId }).sort({ assessmentDate: -1 }).lean(),
      ]);

      if (profile) {
        studentContext.fitnessGoal = profile.fitnessGoal;
        studentContext.activityLevel = profile.activityLevel;
      }
      if (assessment) {
        studentContext.fitnessLevel = assessment.fitnessLevel;
      }
    } catch (ctxErr) {
      console.warn('Could not fetch student profile context for physique analysis:', ctxErr.message);
    }

    // Save image to storage
    const ext = path.extname(req.file.originalname) || '.jpg';
    let storageKey;
    try {
      storageKey = await saveImageToDisk(req.file.buffer, 'physique', ext);
    } catch (diskErr) {
      console.error('Failed to store physique image on disk:', diskErr);
      return res.status(500).json({
        message: 'Failed to securely store the uploaded image. Please try again.',
      });
    }

    // Call Gemini multimodal service
    const modelUsed = getGeminiModel();
    let analysisResult;
    try {
      analysisResult = await analyzePhysiqueImage({
        imageBuffer: req.file.buffer,
        mimeType: req.file.mimetype,
        studentContext,
      });
    } catch (aiErr) {
      console.error('Gemini Physique Analysis failed:', aiErr.message);

      // Record failed record for audit
      await PhysiqueAnalysis.create({
        userId: studentId,
        image: {
          storageKey,
          mimeType: req.file.mimetype,
          fileSize: req.file.buffer.length,
        },
        geminiModel: modelUsed,
        status: 'failed',
        errorMessage: aiErr.message,
      }).catch((dbErr) => console.error('Failed to save failed analysis record:', dbErr.message));

      return res.status(502).json({
        message: aiErr.message || 'Gemini analysis failed. Please verify the image and try again.',
      });
    }

    // Save completed analysis
    const savedDoc = await PhysiqueAnalysis.create({
      userId: studentId,
      image: {
        storageKey,
        mimeType: req.file.mimetype,
        fileSize: req.file.buffer.length,
      },
      analysis: analysisResult,
      geminiModel: modelUsed,
      status: 'completed',
    });

    return res.status(201).json({
      message: 'Physique analysis completed successfully',
      analysis: {
        id: savedDoc._id,
        imageUrl: `/api/student/physique-analysis/image/${savedDoc._id}`,
        isSuitableImage: savedDoc.analysis.isSuitableImage,
        unsuitableReason: savedDoc.analysis.unsuitableReason,
        summary: savedDoc.analysis.summary,
        visibleObservations: savedDoc.analysis.visibleObservations,
        strengthFocus: savedDoc.analysis.strengthFocus,
        mobilityFocus: savedDoc.analysis.mobilityFocus,
        conditioningFocus: savedDoc.analysis.conditioningFocus,
        recommendedFocus: savedDoc.analysis.recommendedFocus,
        beginnerActions: savedDoc.analysis.beginnerActions,
        confidence: savedDoc.analysis.confidence,
        disclaimer: savedDoc.analysis.disclaimer,
        createdAt: savedDoc.createdAt,
      },
    });
  } catch (error) {
    console.error('Unexpected error during physique analysis:', error);
    return res.status(500).json({
      message: 'Server error during physique analysis processing.',
    });
  }
}

/**
 * GET /api/student/physique-analysis
 * Retrieves the latest completed physique analysis for the authenticated student.
 */
export async function getLatestAnalysis(req, res) {
  try {
    const studentId = req.user.id;

    const latest = await PhysiqueAnalysis.findOne({
      userId: studentId,
      status: 'completed',
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!latest) {
      return res.status(200).json({
        analysis: null,
      });
    }

    return res.status(200).json({
      analysis: {
        id: latest._id,
        imageUrl: `/api/student/physique-analysis/image/${latest._id}`,
        isSuitableImage: latest.analysis.isSuitableImage,
        unsuitableReason: latest.analysis.unsuitableReason,
        summary: latest.analysis.summary,
        visibleObservations: latest.analysis.visibleObservations,
        strengthFocus: latest.analysis.strengthFocus,
        mobilityFocus: latest.analysis.mobilityFocus,
        conditioningFocus: latest.analysis.conditioningFocus,
        recommendedFocus: latest.analysis.recommendedFocus,
        beginnerActions: latest.analysis.beginnerActions,
        confidence: latest.analysis.confidence,
        disclaimer: latest.analysis.disclaimer,
        createdAt: latest.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching latest physique analysis:', error);
    return res.status(500).json({
      message: 'Failed to retrieve physique analysis.',
    });
  }
}

/**
 * GET /api/student/physique-analysis/image/:id
 * Securely serves the student's own uploaded physique image.
 */
export async function getAnalysisImage(req, res) {
  try {
    const studentId = req.user.id;
    const { id } = req.params;

    const record = await PhysiqueAnalysis.findById(id).lean();

    if (!record || record.userId.toString() !== studentId) {
      return res.status(404).json({
        message: 'Image not found or unauthorized access.',
      });
    }

    const buffer = await readImageFromDisk(record.image.storageKey);
    if (!buffer) {
      return res.status(404).json({
        message: 'Image file no longer exists on storage.',
      });
    }

    res.setHeader('Content-Type', record.image.mimeType);
    res.setHeader('Cache-Control', 'private, max-age=86400');
    return res.status(200).send(buffer);
  } catch (error) {
    console.error('Error streaming physique image:', error);
    return res.status(500).json({
      message: 'Failed to load physique image.',
    });
  }
}
