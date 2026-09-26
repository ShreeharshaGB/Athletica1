import mongoose from 'mongoose';

const classroomMemberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const classroomTaskCompletionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: 300,
    },
  },
  { _id: false }
);

const classroomTaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: 500,
    },
    type: {
      type: String,
      enum: ['challenge', 'task', 'workout', 'yoga', 'assessment'],
      default: 'challenge',
    },
    points: {
      type: Number,
      default: 50,
      min: 0,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    completions: {
      type: [classroomTaskCompletionSchema],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

const classroomSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    institutionId: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: 500,
    },
    inviteCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    members: {
      type: [classroomMemberSchema],
      default: [],
    },
    tasks: {
      type: [classroomTaskSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const Classroom = mongoose.model('Classroom', classroomSchema);

export default Classroom;
export { Classroom };