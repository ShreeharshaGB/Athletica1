import assert from 'node:assert/strict';
import { test, before, after } from 'node:test';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import app from '../src/app.js';
import connectDB from '../src/config/database.js';
import User from '../src/models/User.js';
import FitnessAssessment from '../src/models/FitnessAssessment.js';
import WorkoutPlan from '../src/models/WorkoutPlan.js';
import { generateDeterministicPlan } from '../src/services/workoutPlanService.js';

let server;
let baseUrl;
const testEmails = [];
const createdPlanIds = [];
const createdAssessmentIds = [];

let studentToken;
let studentId;
let communityToken;
let communityId;
let teacherToken;
let teacherOtherToken;

before(async () => {
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  const ts = Date.now();
  const instId = `INST-WORKOUT-${ts}`;
  const otherInstId = `INST-OTHER-${ts}`;
  const commId = `COMM-WORKOUT-${ts}`;

  // 1. Create Student
  const studentEmail = `student.workout.${ts}@athletica.edu`;
  testEmails.push(studentEmail);
  const studentRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Workout Student',
      email: studentEmail,
      password: 'password123',
      role: 'student',
      institutionId: instId,
    }),
  });
  const studentData = await studentRes.json();
  studentId = studentData.user?.id;

  const sLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: studentEmail, password: 'password123', role: 'student' }),
  }).then((r) => r.json());
  studentToken = sLogin.token;

  // Add assessment for student
  const assess = await FitnessAssessment.create({
    userId: studentId,
    pushUps: 32,
    sitUps: 35,
    runTime: 10.8,
    flexibility: 26,
    shuttleRun: 9.8,
    overallScore: 84,
    fitnessLevel: 'intermediate',
  });
  createdAssessmentIds.push(assess._id);

  // 2. Create Community User
  const communityEmail = `comm.workout.${ts}@athletica.org`;
  testEmails.push(communityEmail);
  const commRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Farmer John',
      email: communityEmail,
      password: 'password123',
      role: 'community',
      communityId: commId,
    }),
  });
  const commData = await commRes.json();
  communityId = commData.user?.id;

  const cLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: communityEmail, password: 'password123', role: 'community' }),
  }).then((r) => r.json());
  communityToken = cLogin.token;

  // 3. Create Teacher in instId
  const teacherEmail = `teacher.workout.${ts}@athletica.edu`;
  testEmails.push(teacherEmail);
  await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Coach Sarah',
      email: teacherEmail,
      password: 'password123',
      role: 'teacher',
      institutionId: instId,
    }),
  });
  const tLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: teacherEmail, password: 'password123', role: 'teacher' }),
  }).then((r) => r.json());
  teacherToken = tLogin.token;

  // 4. Create Teacher in otherInstId
  const teacherOtherEmail = `teacher.other.${ts}@athletica.edu`;
  testEmails.push(teacherOtherEmail);
  await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Coach Dave',
      email: teacherOtherEmail,
      password: 'password123',
      role: 'teacher',
      institutionId: otherInstId,
    }),
  });
  const tOtherLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: teacherOtherEmail, password: 'password123', role: 'teacher' }),
  }).then((r) => r.json());
  teacherOtherToken = tOtherLogin.token;
});

after(async () => {
  if (testEmails.length > 0) {
    await User.deleteMany({ email: { $in: testEmails } });
  }
  if (createdPlanIds.length > 0) {
    await WorkoutPlan.deleteMany({ _id: { $in: createdPlanIds } });
  }
  if (createdAssessmentIds.length > 0) {
    await FitnessAssessment.deleteMany({ _id: { $in: createdAssessmentIds } });
  }
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await mongoose.disconnect();
});

test('1. Deterministic Fallback Generator produces valid 7-day schedule with exercises', () => {
  const plan = generateDeterministicPlan({
    role: 'student',
    fitnessLevel: 'intermediate',
    goal: 'Strength',
    availableTimeMinutes: 30,
  });

  assert.equal(plan.source, 'deterministic_fallback');
  assert.equal(plan.workouts.length, 7);
  assert.equal(plan.workouts[0].dayOfWeek, 'monday');
  assert.ok(plan.workouts[0].exercises.length > 0);
  assert.ok(plan.workouts[0].exercises[0].name);
  assert.ok(plan.workouts[0].exercises[0].instructions);
});

test('2. Student fetches active workout plan and receives assessment-calibrated schedule', async () => {
  const res = await fetch(`${baseUrl}/api/student/workout-plan`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.plan);
  assert.equal(data.hasAssessment, true);
  assert.equal(data.plan.workouts.length, 7);
  assert.equal(data.plan.weeklyCompletionPercentage, 0);

  if (data.plan.id) createdPlanIds.push(data.plan.id);
});

test('3. Student completes an activity: completion state toggles, percentage updates, and points awarded', async () => {
  // Get active plan
  const getRes = await fetch(`${baseUrl}/api/student/workout-plan`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const getData = await getRes.json();
  const firstExercise = getData.plan.workouts[0].exercises[0];

  // Toggle activity complete
  const toggleRes = await fetch(`${baseUrl}/api/student/workout-plan/activity/toggle`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${studentToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dayOfWeek: 'monday',
      exerciseId: firstExercise.id,
      isCompleted: true,
    }),
  });

  assert.equal(toggleRes.status, 200);
  const toggleData = await toggleRes.json();
  assert.equal(toggleData.exercise.isCompleted, true);
  assert.ok(toggleData.plan.weeklyCompletionPercentage > 0);
  assert.equal(toggleData.pointsAwarded, 15);
});

test('4. Community User generates plan specifying "Farming / agricultural work" daily context', async () => {
  const genRes = await fetch(`${baseUrl}/api/community/workout-plan/generate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${communityToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      goal: 'Mobility & Recovery',
      fitnessLevel: 'beginner',
      availableTimeMinutes: 25,
      dailyActivityContext: 'Farming / agricultural work',
    }),
  });

  assert.equal(genRes.status, 201);
  const genData = await genRes.json();
  assert.ok(genData.plan);
  assert.equal(genData.plan.dailyActivityContext, 'Farming / agricultural work');
  assert.equal(genData.plan.role, 'community');
  assert.equal(genData.plan.workouts.length, 7);

  // Verify farming mobility & lumbar decompression exercises exist
  const exercisesMonday = genData.plan.workouts[0].exercises.map((e) => e.name.toLowerCase()).join(' ');
  assert.ok(
    exercisesMonday.includes('child') ||
    exercisesMonday.includes('hip') ||
    exercisesMonday.includes('stretch') ||
    exercisesMonday.includes('decompression') ||
    exercisesMonday.includes('core')
  );

  if (genData.plan.id) createdPlanIds.push(genData.plan.id);
});

test('5. Community User completes an activity and verifies progress updates', async () => {
  const getRes = await fetch(`${baseUrl}/api/community/workout-plan`, {
    headers: { Authorization: `Bearer ${communityToken}` },
  });
  const getData = await getRes.json();
  const firstExercise = getData.plan.workouts[0].exercises[0];

  const toggleRes = await fetch(`${baseUrl}/api/community/workout-plan/activity/toggle`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${communityToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dayOfWeek: 'monday',
      exerciseId: firstExercise.id,
      isCompleted: true,
    }),
  });

  assert.equal(toggleRes.status, 200);
  const toggleData = await toggleRes.json();
  assert.equal(toggleData.exercise.isCompleted, true);
  assert.ok(toggleData.plan.completedActivitiesCount >= 1);
});

test('6. Teacher Talent Discovery returns institution-scoped student strengths with neutral labels', async () => {
  const res = await fetch(`${baseUrl}/api/teacher/talent-discovery`, {
    headers: { Authorization: `Bearer ${teacherToken}` },
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.talentList));
  assert.equal(data.totalStudents, 1);
  assert.equal(data.assessedCount, 1);

  const studentEntry = data.talentList.find((s) => s.id === studentId);
  assert.ok(studentEntry);
  assert.equal(studentEntry.hasAssessment, true);
  assert.ok(studentEntry.statusLabel.startsWith('Strong in') || studentEntry.statusLabel.includes('Fitness'));
  assert.ok(studentEntry.score > 0);
  assert.ok(studentEntry.metrics);
  assert.equal(studentEntry.metrics.pushUps, 32);
});

test('7. Teacher Security: Teacher from another institution CANNOT see talent discovery of other students', async () => {
  const res = await fetch(`${baseUrl}/api/teacher/talent-discovery`, {
    headers: { Authorization: `Bearer ${teacherOtherToken}` },
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.totalStudents, 0);
  assert.equal(data.talentList.length, 0);
});

test('8. Teacher Student Insights returns institution-level statistics from real data', async () => {
  const res = await fetch(`${baseUrl}/api/teacher/student-insights`, {
    headers: { Authorization: `Bearer ${teacherToken}` },
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.totalStudents, 1);
  assert.equal(data.assessedStudents, 1);
  assert.equal(data.unassessedStudents, 0);
  assert.equal(data.completionPercentage, 100);
  assert.equal(data.averageFitnessScore, 84);
  assert.ok(data.fitnessAreasAverages.strength > 0);
  assert.ok(data.fitnessAreasAverages.endurance > 0);
  assert.ok(data.fitnessAreasAverages.flexibility > 0);
});
