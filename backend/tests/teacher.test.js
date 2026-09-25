import assert from 'node:assert/strict';
import { test, before, after } from 'node:test';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import app from '../src/app.js';
import connectDB from '../src/config/database.js';
import User from '../src/models/User.js';
import FitnessAssessment from '../src/models/FitnessAssessment.js';
import StudentProfile from '../src/models/StudentProfile.js';

let server;
let baseUrl;
const testEmails = [];
const createdAssessmentIds = [];
const createdProfileIds = [];

let teacher1Token;
let teacher2Token;
let student1Token;
let student1Id;
let student2Id;
let student3Id;

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
  const inst1 = `TEACH-001-${ts}`;
  const inst2 = `TEACH-002-${ts}`;

  // Register Teacher 1
  const teacher1Email = `t1_${ts}@test.com`;
  testEmails.push(teacher1Email);
  await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Teacher 1',
      email: teacher1Email,
      password: 'password123',
      role: 'teacher',
      institutionId: inst1
    })
  });
  const t1Login = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: teacher1Email, password: 'password123', role: 'teacher' })
  }).then((r) => r.json());
  teacher1Token = t1Login.token;

  // Register Teacher 2
  const teacher2Email = `t2_${ts}@test.com`;
  testEmails.push(teacher2Email);
  await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Teacher 2',
      email: teacher2Email,
      password: 'password123',
      role: 'teacher',
      institutionId: inst2
    })
  });
  const t2Login = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: teacher2Email, password: 'password123', role: 'teacher' })
  }).then((r) => r.json());
  teacher2Token = t2Login.token;

  // Register Student 1
  const student1Email = `s1_${ts}@test.com`;
  testEmails.push(student1Email);
  const s1Reg = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Student 1 College 1',
      email: student1Email,
      password: 'password123',
      role: 'student',
      institutionId: inst1
    })
  }).then((r) => r.json());
  student1Id = s1Reg.user.id;

  const s1Login = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: student1Email, password: 'password123', role: 'student' })
  }).then((r) => r.json());
  student1Token = s1Login.token;

  // Register Student 2
  const student2Email = `s2_${ts}@test.com`;
  testEmails.push(student2Email);
  const s2Reg = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Student 2 College 1',
      email: student2Email,
      password: 'password123',
      role: 'student',
      institutionId: inst1
    })
  }).then((r) => r.json());
  student2Id = s2Reg.user.id;

  // Register Student 3
  const student3Email = `s3_${ts}@test.com`;
  testEmails.push(student3Email);
  const s3Reg = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Student 3 College 2',
      email: student3Email,
      password: 'password123',
      role: 'student',
      institutionId: inst2
    })
  }).then((r) => r.json());
  student3Id = s3Reg.user.id;

  // Create Profile and Assessment for Student 1
  const prof1 = await StudentProfile.create({
    userId: student1Id,
    age: 18,
    gender: 'female',
    height: 165,
    weight: 55,
    location: 'Campus Gym',
    fitnessGoal: 'Speed',
    activityLevel: 'intermediate',
    dietPreference: 'vegetarian'
  });
  createdProfileIds.push(prof1._id);

  const assess1 = await FitnessAssessment.create({
    userId: student1Id,
    pushUps: 25,
    sitUps: 30,
    runTime: 12.5,
    flexibility: 22,
    shuttleRun: 10.2,
    overallScore: 84,
    fitnessLevel: 'intermediate',
    assessmentDate: new Date()
  });
  createdAssessmentIds.push(assess1._id);
});

after(async () => {
  if (testEmails.length > 0) {
    await User.deleteMany({ email: { $in: testEmails } });
  }
  if (createdAssessmentIds.length > 0) {
    await FitnessAssessment.deleteMany({ _id: { $in: createdAssessmentIds } });
  }
  if (createdProfileIds.length > 0) {
    await StudentProfile.deleteMany({ _id: { $in: createdProfileIds } });
  }

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

test('1. Unauthenticated request to /api/teacher/students returns 401', async () => {
  const res = await fetch(`${baseUrl}/api/teacher/students`);
  assert.equal(res.status, 401);
});

test('2. Student role accessing /api/teacher/students returns 403', async () => {
  const res = await fetch(`${baseUrl}/api/teacher/students`, {
    headers: { Authorization: `Bearer ${student1Token}` }
  });
  assert.equal(res.status, 403);
});

test('3. Teacher 1 sees only Student 1 & 2, NOT Student 3', async () => {
  const res = await fetch(`${baseUrl}/api/teacher/students`, {
    headers: { Authorization: `Bearer ${teacher1Token}` }
  });
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.ok(data.institutionId.startsWith('TEACH-001'));
  assert.ok(Array.isArray(data.students));

  const emails = data.students.map((s) => s.email);
  assert.ok(emails.includes(testEmails[2]), 'Should contain Student 1');
  assert.ok(emails.includes(testEmails[3]), 'Should contain Student 2');
  assert.ok(!emails.includes(testEmails[4]), 'Must NOT contain Student 3');

  // Verify Student 1 has enriched assessment and profile data
  const s1Data = data.students.find((s) => s.id === student1Id);
  assert.equal(s1Data.assessmentStatus, 'Completed');
  assert.equal(s1Data.fitnessScore, 84);
  assert.equal(s1Data.fitnessLevel, 'intermediate');
  assert.equal(s1Data.profileStatus, 'Complete');
  assert.equal(s1Data.profile.age, 18);

  // Verify Student 2 has pending assessment
  const s2Data = data.students.find((s) => s.id === student2Id);
  assert.equal(s2Data.assessmentStatus, 'Pending');
  assert.equal(s2Data.fitnessScore, null);
  assert.equal(s2Data.fitnessLevel, null);
  assert.equal(s2Data.profileStatus, 'Incomplete');
  assert.equal(s2Data.profile, null);
});

test('4. Teacher 2 sees only Student 3, NOT Student 1 or 2', async () => {
  const res = await fetch(`${baseUrl}/api/teacher/students`, {
    headers: { Authorization: `Bearer ${teacher2Token}` }
  });
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.ok(data.institutionId.startsWith('TEACH-002'));
  const emails = data.students.map((s) => s.email);
  assert.ok(emails.includes(testEmails[4]), 'Should contain Student 3');
  assert.ok(!emails.includes(testEmails[2]), 'Must NOT contain Student 1');
  assert.ok(!emails.includes(testEmails[3]), 'Must NOT contain Student 2');
});

test('5. Teacher 1 stats API returns accurate real calculations', async () => {
  const res = await fetch(`${baseUrl}/api/teacher/stats`, {
    headers: { Authorization: `Bearer ${teacher1Token}` }
  });
  assert.equal(res.status, 200);
  const stats = await res.json();

  assert.ok(stats.institutionId.startsWith('TEACH-001'));
  assert.equal(stats.totalStudents, 2);
  assert.equal(stats.assessmentsCompleted, 1);
  assert.equal(stats.assessmentsPending, 1);
  assert.equal(stats.averageFitnessScore, 84);
});

test('6. Student details API enforcement by institution', async () => {
  // Teacher 1 accesses Student 1 (same institution) -> 200 with details
  const res1 = await fetch(`${baseUrl}/api/teacher/students/${student1Id}`, {
    headers: { Authorization: `Bearer ${teacher1Token}` }
  });
  assert.equal(res1.status, 200);
  const data1 = await res1.json();
  assert.equal(data1.student.name, 'Student 1 College 1');
  assert.equal(data1.student.fitnessScore, 84);
  assert.equal(data1.student.assessmentHistory.length, 1);

  // Teacher 1 accesses Student 3 (different institution) -> 404
  const res3 = await fetch(`${baseUrl}/api/teacher/students/${student3Id}`, {
    headers: { Authorization: `Bearer ${teacher1Token}` }
  });
  assert.equal(res3.status, 404);
});
