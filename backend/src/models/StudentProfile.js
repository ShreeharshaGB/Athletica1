import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ['male', 'female', 'other'],
      lowercase: true,
      trim: true,
    },
    height: {
      type: Number,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    fitnessGoal: {
      type: String,
      required: true,
      trim: true,
    },
    activityLevel: {
      type: String,
      required: true,
      enum: ['beginner', 'intermediate', 'advanced'],
      lowercase: true,
      trim: true,
    },
    dietPreference: {
      type: String,
      required: true,
      enum: ['vegetarian', 'non-vegetarian', 'eggetarian'],
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);

export default StudentProfile;
export { StudentProfile };
