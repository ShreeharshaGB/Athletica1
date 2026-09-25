import 'dotenv/config';
import express from 'express';
import authRoutes from './routes/authRoutes.js';
import studentProfileRoutes from './routes/studentProfileRoutes.js';
import fitnessAssessmentRoutes from './routes/fitnessAssessmentRoutes.js';
import workoutPlanRoutes from './routes/workoutPlanRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import physiqueAnalysisRoutes from './routes/physiqueAnalysisRoutes.js';

const app = express();

const defaultOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'https://athletica1-frontend.onrender.com',
];

const configuredOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const allowedOrigins = new Set([
  ...defaultOrigins.map((origin) => origin.replace(/\/+$/, '')),
  ...configuredOrigins,
]);

app.disable('x-powered-by');
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin) {
    const normalizedOrigin = origin.replace(/\/+$/, '');
    if (allowedOrigins.has(normalizedOrigin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    }
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
});

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Athletica API is running',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/student/profile', studentProfileRoutes);
app.use('/api/student/assessment', fitnessAssessmentRoutes);
app.use('/api/student/workout-plan', workoutPlanRoutes);
app.use('/api/student/physique-analysis', physiqueAnalysisRoutes);
app.use('/api/teacher', teacherRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl,
  });
});

app.use((error, req, res, next) => {
  console.error('Unhandled API error:', error);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({
    message: 'Internal server error',
  });
});

export default app;
