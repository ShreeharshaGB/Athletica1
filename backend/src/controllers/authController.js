import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, role, institutionId } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !role ||
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !name.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      return res.status(400).json({
        message: 'Name, email, password and role are required'
      });
    }

    const allowedRoles = ['student', 'teacher', 'community'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: 'Invalid role. Role must be student, teacher, or community'
      });
    }

    if (role === 'student' || role === 'teacher') {
      if (!institutionId || typeof institutionId !== 'string' || !institutionId.trim()) {
        return res.status(400).json({
          message: 'Institution/College ID is required for student and teacher registration'
        });
      }
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return res.status(400).json({ message: 'A valid email address is required' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        message: 'Email is already registered'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const normalizedInstitutionId =
      institutionId && typeof institutionId === 'string' && institutionId.trim()
        ? institutionId.trim().toUpperCase()
        : null;

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
      institutionId: normalizedInstitutionId
    });

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        institutionId: user.institutionId || null
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      message: 'Server error during registration'
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (
      !email ||
      !password ||
      !role ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password.trim() ||
      typeof role !== 'string' ||
      !role.trim()
    ) {
      return res.status(400).json({
        message: 'Email, password and role are required'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    if (user.role !== role) {
      return res.status(403).json({
        message: 'Role does not match this account'
      });
    }

    const jwtSecret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY;
    if (!jwtSecret) {
      console.error('JWT secret is not configured in environment variables');
      return res.status(500).json({
        message: 'Server configuration error'
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        institutionId: user.institutionId || null
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      message: 'Server error during login'
    });
  }
};
