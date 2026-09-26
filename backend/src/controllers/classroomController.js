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
    tasksCount: classroom.tasks?.length || 0,
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

export async function getClassroomDetails(req, res) {
  try {
    const { id } = req.params;
    const classroom = await Classroom.findById(id)
      .populate('teacherId', 'name email institutionId')
      .populate('members.userId', 'name email institutionId')
      .populate('tasks.completions.studentId', 'name email');

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found.' });
    }

    const teacherIdStr = classroom.teacherId?._id ? classroom.teacherId._id.toString() : classroom.teacherId?.toString();
    const isTeacher = teacherIdStr === req.user.id;
    const isMember = classroom.members.some(
      (m) => m.userId && (m.userId._id ? m.userId._id.toString() : m.userId.toString()) === req.user.id
    );

    if (!isTeacher && !isMember) {
      return res.status(403).json({ message: 'You do not have access to view this classroom.' });
    }

    const currentUserId = req.user.id;
    const formattedTasks = (classroom.tasks || []).map((t) => {
      const completion = t.completions?.find(
        (c) => c.studentId && (c.studentId._id ? c.studentId._id.toString() : c.studentId.toString()) === currentUserId
      );

      return {
        id: t._id,
        title: t.title,
        description: t.description,
        type: t.type,
        points: t.points,
        dueDate: t.dueDate,
        createdAt: t.createdAt,
        completedCount: t.completions?.length || 0,
        hasCompleted: Boolean(completion),
        completedAt: completion?.completedAt || null,
        completions: isTeacher
          ? (t.completions || []).map((c) => ({
              student: c.studentId ? { id: c.studentId._id, name: c.studentId.name, email: c.studentId.email } : null,
              completedAt: c.completedAt,
              notes: c.notes,
            }))
          : undefined,
      };
    });

    const membersList = (classroom.members || [])
      .filter((m) => m.userId)
      .map((m) => ({
        id: m.userId._id,
        name: m.userId.name,
        email: m.userId.email,
        institutionId: m.userId.institutionId,
        joinedAt: m.joinedAt,
      }));

    return res.status(200).json({
      classroom: {
        id: classroom._id,
        name: classroom.name,
        description: classroom.description,
        inviteCode: classroom.inviteCode,
        institutionId: classroom.institutionId,
        isTeacher,
        teacher: classroom.teacherId
          ? {
              id: classroom.teacherId._id,
              name: classroom.teacherId.name,
              email: classroom.teacherId.email,
            }
          : undefined,
        memberCount: membersList.length,
        members: membersList,
        tasks: formattedTasks,
        createdAt: classroom.createdAt,
        updatedAt: classroom.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get classroom details error:', error);
    return res.status(500).json({ message: 'Server error while loading classroom details.' });
  }
}

export async function createClassroomTask(req, res) {
  try {
    const { id } = req.params;
    const { title, description = '', type = 'challenge', points = 50, dueDate = null } = req.body || {};

    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'Challenge or task title is required.' });
    }

    const classroom = await Classroom.findById(id);
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found.' });
    }

    if (classroom.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the classroom teacher can assign tasks.' });
    }

    const newTask = {
      title: title.trim(),
      description: String(description).trim(),
      type: ['challenge', 'task', 'workout', 'yoga', 'assessment'].includes(type) ? type : 'challenge',
      points: Number(points) > 0 ? Number(points) : 50,
      dueDate: dueDate ? new Date(dueDate) : null,
      completions: [],
      createdAt: new Date(),
    };

    classroom.tasks.push(newTask);
    await classroom.save();

    const created = classroom.tasks[classroom.tasks.length - 1];

    return res.status(201).json({
      message: 'Task assigned successfully.',
      task: {
        id: created._id,
        title: created.title,
        description: created.description,
        type: created.type,
        points: created.points,
        dueDate: created.dueDate,
        completedCount: 0,
        hasCompleted: false,
        createdAt: created.createdAt,
      },
    });
  } catch (error) {
    console.error('Create classroom task error:', error);
    return res.status(500).json({ message: 'Server error while creating task.' });
  }
}

export async function completeClassroomTask(req, res) {
  try {
    const { id, taskId } = req.params;
    const { notes = '' } = req.body || {};

    const classroom = await Classroom.findById(id);
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found.' });
    }

    const isMember = classroom.members.some(
      (m) => m.userId.toString() === req.user.id
    );
    if (!isMember) {
      return res.status(403).json({ message: 'You must be an enrolled student in this classroom.' });
    }

    const task = classroom.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found in this classroom.' });
    }

    const alreadyCompleted = task.completions.some(
      (c) => c.studentId.toString() === req.user.id
    );

    if (alreadyCompleted) {
      return res.status(200).json({ message: 'You have already completed this task.', alreadyCompleted: true });
    }

    task.completions.push({
      studentId: req.user.id,
      completedAt: new Date(),
      notes: String(notes).trim(),
    });

    await classroom.save();

    return res.status(200).json({
      message: 'Task marked as completed! Points awarded.',
      pointsAwarded: task.points,
      taskId: task._id,
      completedAt: new Date(),
    });
  } catch (error) {
    console.error('Complete classroom task error:', error);
    return res.status(500).json({ message: 'Server error while completing task.' });
  }
}