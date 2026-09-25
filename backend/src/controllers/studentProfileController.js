import StudentProfile from '../models/StudentProfile.js';

const VALID_GENDERS = ['male', 'female', 'other'];
const VALID_ACTIVITY_LEVELS = ['beginner', 'intermediate', 'advanced'];
const VALID_DIET_PREFERENCES = ['vegetarian', 'non-vegetarian', 'eggetarian'];

const formatProfile = (profile) => ({
  id: profile._id,
  userId: profile.userId,
  age: profile.age,
  gender: profile.gender,
  height: profile.height,
  weight: profile.weight,
  location: profile.location || '',
  fitnessGoal: profile.fitnessGoal,
  activityLevel: profile.activityLevel,
  dietPreference: profile.dietPreference,
  createdAt: profile.createdAt,
  updatedAt: profile.updatedAt,
});

export const createProfile = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        message: 'Only students can create a student profile'
      });
    }

    const existingProfile = await StudentProfile.findOne({ userId: req.user.id });
    if (existingProfile) {
      return res.status(409).json({
        message: 'Student profile already exists'
      });
    }

    const {
      age,
      gender,
      height,
      weight,
      location,
      fitnessGoal,
      activityLevel,
      dietPreference
    } = req.body;

    // Validation
    if (
      age === undefined ||
      gender === undefined ||
      height === undefined ||
      weight === undefined ||
      fitnessGoal === undefined ||
      activityLevel === undefined ||
      dietPreference === undefined
    ) {
      return res.status(400).json({
        message: 'Age, gender, height, weight, fitnessGoal, activityLevel, and dietPreference are required'
      });
    }

    const numAge = Number(age);
    const numHeight = Number(height);
    const numWeight = Number(weight);

    if (isNaN(numAge) || numAge <= 0 || !Number.isInteger(numAge)) {
      return res.status(400).json({
        message: 'Age must be a positive integer'
      });
    }

    if (isNaN(numHeight) || numHeight <= 0) {
      return res.status(400).json({
        message: 'Height must be a positive number in centimeters'
      });
    }

    if (isNaN(numWeight) || numWeight <= 0) {
      return res.status(400).json({
        message: 'Weight must be a positive number in kilograms'
      });
    }

    if (typeof gender !== 'string' || !VALID_GENDERS.includes(gender.trim().toLowerCase())) {
      return res.status(400).json({
        message: 'Gender must be one of: male, female, other'
      });
    }

    if (typeof fitnessGoal !== 'string' || !fitnessGoal.trim()) {
      return res.status(400).json({
        message: 'Fitness goal is required'
      });
    }

    if (
      typeof activityLevel !== 'string' ||
      !VALID_ACTIVITY_LEVELS.includes(activityLevel.trim().toLowerCase())
    ) {
      return res.status(400).json({
        message: 'Activity level must be one of: beginner, intermediate, advanced'
      });
    }

    if (
      typeof dietPreference !== 'string' ||
      !VALID_DIET_PREFERENCES.includes(dietPreference.trim().toLowerCase())
    ) {
      return res.status(400).json({
        message: 'Diet preference must be one of: vegetarian, non-vegetarian, eggetarian'
      });
    }

    const newProfile = await StudentProfile.create({
      userId: req.user.id,
      age: numAge,
      gender: gender.trim().toLowerCase(),
      height: numHeight,
      weight: numWeight,
      location: typeof location === 'string' ? location.trim() : '',
      fitnessGoal: fitnessGoal.trim(),
      activityLevel: activityLevel.trim().toLowerCase(),
      dietPreference: dietPreference.trim().toLowerCase()
    });

    return res.status(201).json({
      message: 'Student profile created successfully',
      profile: formatProfile(newProfile)
    });
  } catch (error) {
    console.error('Create profile error:', error);
    return res.status(500).json({
      message: 'Server error while creating student profile'
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        message: 'Only students can access student profile'
      });
    }

    const profile = await StudentProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({
        message: 'Student profile not found'
      });
    }

    return res.status(200).json({
      profile: formatProfile(profile)
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      message: 'Server error while fetching student profile'
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        message: 'Only students can update student profile'
      });
    }

    const profile = await StudentProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({
        message: 'Student profile not found'
      });
    }

    const {
      age,
      gender,
      height,
      weight,
      location,
      fitnessGoal,
      activityLevel,
      dietPreference
    } = req.body;

    if (age !== undefined) {
      const numAge = Number(age);
      if (isNaN(numAge) || numAge <= 0 || !Number.isInteger(numAge)) {
        return res.status(400).json({ message: 'Age must be a positive integer' });
      }
      profile.age = numAge;
    }

    if (gender !== undefined) {
      if (typeof gender !== 'string' || !VALID_GENDERS.includes(gender.trim().toLowerCase())) {
        return res.status(400).json({ message: 'Gender must be one of: male, female, other' });
      }
      profile.gender = gender.trim().toLowerCase();
    }

    if (height !== undefined) {
      const numHeight = Number(height);
      if (isNaN(numHeight) || numHeight <= 0) {
        return res.status(400).json({ message: 'Height must be a positive number in centimeters' });
      }
      profile.height = numHeight;
    }

    if (weight !== undefined) {
      const numWeight = Number(weight);
      if (isNaN(numWeight) || numWeight <= 0) {
        return res.status(400).json({ message: 'Weight must be a positive number in kilograms' });
      }
      profile.weight = numWeight;
    }

    if (location !== undefined) {
      profile.location = typeof location === 'string' ? location.trim() : '';
    }

    if (fitnessGoal !== undefined) {
      if (typeof fitnessGoal !== 'string' || !fitnessGoal.trim()) {
        return res.status(400).json({ message: 'Fitness goal cannot be empty' });
      }
      profile.fitnessGoal = fitnessGoal.trim();
    }

    if (activityLevel !== undefined) {
      if (
        typeof activityLevel !== 'string' ||
        !VALID_ACTIVITY_LEVELS.includes(activityLevel.trim().toLowerCase())
      ) {
        return res.status(400).json({
          message: 'Activity level must be one of: beginner, intermediate, advanced'
        });
      }
      profile.activityLevel = activityLevel.trim().toLowerCase();
    }

    if (dietPreference !== undefined) {
      if (
        typeof dietPreference !== 'string' ||
        !VALID_DIET_PREFERENCES.includes(dietPreference.trim().toLowerCase())
      ) {
        return res.status(400).json({
          message: 'Diet preference must be one of: vegetarian, non-vegetarian, eggetarian'
        });
      }
      profile.dietPreference = dietPreference.trim().toLowerCase();
    }

    // Explicitly guarantee userId is never modified
    profile.userId = req.user.id;

    await profile.save();

    return res.status(200).json({
      message: 'Student profile updated successfully',
      profile: formatProfile(profile)
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      message: 'Server error while updating student profile'
    });
  }
};
