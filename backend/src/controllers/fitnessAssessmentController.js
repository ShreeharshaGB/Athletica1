import mongoose from 'mongoose';
import FitnessAssessment from '../models/FitnessAssessment.js';

const validateMeasurement = (val, fieldName) => {
  if (val === undefined || val === null || val === '') {
    return `${fieldName} is required`;
  }
  if (typeof val === 'boolean' || Array.isArray(val) || (typeof val === 'object' && val !== null)) {
    return `${fieldName} must be a valid number`;
  }
  const num = Number(val);
  if (isNaN(num)) {
    return `${fieldName} must be a valid number`;
  }
  if (num < 0) {
    return `${fieldName} cannot be negative`;
  }
  return null;
};

const formatAssessment = (assessment) => {
  const formatted = {
    id: assessment._id,
    userId: assessment.userId,
    assessmentDate: assessment.assessmentDate,
    pushUps: assessment.pushUps,
    sitUps: assessment.sitUps,
    runTime: assessment.runTime,
    flexibility: assessment.flexibility,
    shuttleRun: assessment.shuttleRun,
    createdAt: assessment.createdAt,
    updatedAt: assessment.updatedAt,
  };
  if (assessment.overallScore !== undefined) {
    formatted.overallScore = assessment.overallScore;
  }
  if (assessment.fitnessLevel !== undefined) {
    formatted.fitnessLevel = assessment.fitnessLevel;
  }
  return formatted;
};

export const createAssessment = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        message: 'Only students can create a fitness assessment'
      });
    }

    const {
      pushUps,
      sitUps,
      runTime,
      flexibility,
      shuttleRun,
      assessmentDate
    } = req.body;

    const fieldsToValidate = [
      { val: pushUps, name: 'Push-up count' },
      { val: sitUps, name: 'Sit-up count' },
      { val: runTime, name: 'Run time' },
      { val: flexibility, name: 'Flexibility' },
      { val: shuttleRun, name: 'Shuttle run' },
    ];

    for (const field of fieldsToValidate) {
      const errorMsg = validateMeasurement(field.val, field.name);
      if (errorMsg) {
        return res.status(400).json({ message: errorMsg });
      }
    }

    let parsedDate = new Date();
    if (assessmentDate !== undefined && assessmentDate !== null) {
      const d = new Date(assessmentDate);
      if (isNaN(d.getTime())) {
        return res.status(400).json({ message: 'Invalid assessment date format' });
      }
      parsedDate = d;
    }

    const newAssessment = await FitnessAssessment.create({
      userId: req.user.id,
      assessmentDate: parsedDate,
      pushUps: Number(pushUps),
      sitUps: Number(sitUps),
      runTime: Number(runTime),
      flexibility: Number(flexibility),
      shuttleRun: Number(shuttleRun)
    });

    return res.status(201).json({
      message: 'Fitness assessment created successfully',
      assessment: formatAssessment(newAssessment)
    });
  } catch (error) {
    console.error('Create assessment error:', error);
    return res.status(500).json({
      message: 'Server error while creating fitness assessment'
    });
  }
};

export const getLatestAssessment = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        message: 'Only students can access fitness assessment'
      });
    }

    const assessment = await FitnessAssessment.findOne({ userId: req.user.id })
      .sort({ assessmentDate: -1, createdAt: -1 });

    if (!assessment) {
      return res.status(404).json({
        message: 'Fitness assessment not found'
      });
    }

    return res.status(200).json({
      assessment: formatAssessment(assessment)
    });
  } catch (error) {
    console.error('Get latest assessment error:', error);
    return res.status(500).json({
      message: 'Server error while fetching latest fitness assessment'
    });
  }
};

export const getAssessmentHistory = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        message: 'Only students can access fitness assessment history'
      });
    }

    const assessments = await FitnessAssessment.find({ userId: req.user.id })
      .sort({ assessmentDate: -1, createdAt: -1 });

    return res.status(200).json({
      assessments: assessments.map(formatAssessment)
    });
  } catch (error) {
    console.error('Get assessment history error:', error);
    return res.status(500).json({
      message: 'Server error while fetching assessment history'
    });
  }
};

export const updateAssessment = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        message: 'Only students can update a fitness assessment'
      });
    }

    const { assessmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
      return res.status(404).json({
        message: 'Fitness assessment not found'
      });
    }

    const assessment = await FitnessAssessment.findById(assessmentId);

    if (!assessment) {
      return res.status(404).json({
        message: 'Fitness assessment not found'
      });
    }

    if (assessment.userId.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'You are not authorized to modify this assessment'
      });
    }

    const { pushUps, sitUps, runTime, flexibility, shuttleRun } = req.body;

    const fieldsToValidate = [
      { key: 'pushUps', val: pushUps, name: 'Push-up count' },
      { key: 'sitUps', val: sitUps, name: 'Sit-up count' },
      { key: 'runTime', val: runTime, name: 'Run time' },
      { key: 'flexibility', val: flexibility, name: 'Flexibility' },
      { key: 'shuttleRun', val: shuttleRun, name: 'Shuttle run' },
    ];

    for (const field of fieldsToValidate) {
      if (field.val !== undefined) {
        const errorMsg = validateMeasurement(field.val, field.name);
        if (errorMsg) {
          return res.status(400).json({ message: errorMsg });
        }
      }
    }

    if (pushUps !== undefined) assessment.pushUps = Number(pushUps);
    if (sitUps !== undefined) assessment.sitUps = Number(sitUps);
    if (runTime !== undefined) assessment.runTime = Number(runTime);
    if (flexibility !== undefined) assessment.flexibility = Number(flexibility);
    if (shuttleRun !== undefined) assessment.shuttleRun = Number(shuttleRun);

    // Guaranteed immutability of identity and date
    assessment.userId = req.user.id;

    await assessment.save();

    return res.status(200).json({
      message: 'Fitness assessment updated successfully',
      assessment: formatAssessment(assessment)
    });
  } catch (error) {
    console.error('Update assessment error:', error);
    return res.status(500).json({
      message: 'Server error while updating fitness assessment'
    });
  }
};
