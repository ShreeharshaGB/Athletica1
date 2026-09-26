import crypto from 'crypto';
import Classroom from '../models/Classroom.js';
import User from '../models/User.js';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function createInviteCode() {
  const bytes = crypto.randomBytes(8);
  return Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join('');
}

function formatClassroom(classroom, teacher = null) {
  return {
    id: classroom._id,
    name: classroom.name,
    description: classroom.description,
    inviteCode: classroom.inviteCode,
    institutionId: classroom.institutionId,
    teacher: teacher
      ? { id: teacher._id, name: teacher.name, email: teacher.email }
      : undefined,
    memberCount: classroom.members?.length || 0,
    createdAt: classroom.createdAt,
    updatedAt: classroom.updatedAt,
  };
}

export async function createClassroom(req, res) {
  try {
    const { name, description = '' } = req.body || {};
    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Classroom name is required.' });
    }
    if (name.trim().length > 100 || String(description).length > 500) {
      return res.status(400).json({ message: 'Classroom name or description is too long.' });
    }

    let inviteCode;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const candidate = createInviteCode();
      const exists = await Classroom.exists({ inviteCode: candidate });
      if (!exists) {
        inviteCode = candidate;
        break;
      }
    }
    if (!inviteCode) {
      return res.status(503).json({ message: 'Could not generate a unique invite code. Please try again.' });
    }

    const classroom = await Classroom.create({
      teacherId: req.user.id,
      institutionId: req.user.institutionId || null,
      name: name.trim(),
      description: String(description).trim(),
      inviteCode,
    });

    return res.status(201).json({ classroom: formatClassroom(classroom) });
  } catch (error) {
    console.error('Create classroom error:', error);
    return res.status(500).json({ message: 'Server error while creating classroom.' });
  }
}

export async function getTeacherClassrooms(req, res) {
  try {
    const classrooms = await Classroom.find({ teacherId: req.user.id }).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ classrooms: classrooms.map((classroom) => formatClassroom(classroom)) });
  } catch (error) {
    console.error('Get teacher classrooms error:', error);
    return res.status(500).json({ message: 'Server error while loading classrooms.' });
  }
}

export async function joinClassroom(req, res) {
  try {
    const { code } = req.body || {};
    const normalizedCode = typeof code === 'string' ? code.trim().toUpperCase() : '';
    if (!normalizedCode) {
      return res.status(400).json({ message: 'Enter a classroom invite code.' });
    }

    const classroom = await Classroom.findOne({ inviteCode: normalizedCode });
    if (!classroom) {
      return res.status(404).json({ message: 'No classroom was found for that code.' });
    }

    const alreadyMember = classroom.members.some((member) => member.userId.toString() === req.user.id);
    if (!alreadyMember) {
      classroom.members.push({ userId: req.user.id });
      await classroom.save();
    }

    const teacher = await User.findById(classroom.teacherId).select('name email').lean();
    return res.status(alreadyMember ? 200 : 201).json({
      message: alreadyMember ? 'You are already in this classroom.' : 'You joined the classroom successfully.',
      classroom: formatClassroom(classroom.toObject(), teacher),
    });
  } catch (error) {
    console.error('Join classroom error:', error);
    return res.status(500).json({ message: 'Server error while joining classroom.' });
  }
}

export async function getStudentClassrooms(req, res) {
  try {
    const classrooms = await Classroom.find({ 'members.userId': req.user.id })
      .populate('teacherId', 'name email')
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({
      classrooms: classrooms.map((classroom) => formatClassroom(classroom, classroom.teacherId)),
    });
  } catch (error) {
    console.error('Get student classrooms error:', error);
    return res.status(500).json({ message: 'Server error while loading joined classrooms.' });
  }
}