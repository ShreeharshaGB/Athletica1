import assert from 'node:assert/strict';
import { test, before, after } from 'node:test';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import app from '../src/app.js';
import connectDB from '../src/config/database.js';
import User from '../src/models/User.js';
import Activity from '../src/models/Activity.js';
import ActivityParticipation from '../src/models/ActivityParticipation.js';

let server;
let baseUrl;
const testEmails = [];
const createdActivityIds = [];
const createdParticipationIds = [];

let userAToken;
let userAId;
let userBToken;
let userBId;
let userCToken;
let userCId;
let studentToken;
let teacherToken;

const COMM_A = 'MANGALORE-FITNESS';
const COMM_B = 'OTHER-COMMUNITY';

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

  // Register Community User A
  const emailA = `comm_a_${ts}@test.com`;
  testEmails.push(emailA);
  const regA = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Community User A',
      email: emailA,
      password: 'password123',
      role: 'community',
      communityId: '  mangalore-fitness  ', // Test normalization
    }),
  }).then((r) => r.json());
  userAId = regA.user.id;

  const loginA = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: emailA, password: 'password123', role: 'community' }),
  }).then((r) => r.json());
  userAToken = loginA.token;

  // Register Community User B
  const emailB = `comm_b_${ts}@test.com`;
  testEmails.push(emailB);
  const regB = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Community User B',
      email: emailB,
      password: 'password123',
      role: 'community',
      communityId: COMM_A,
    }),
  }).then((r) => r.json());
  userBId = regB.user.id;

  const loginB = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: emailB, password: 'password123', role: 'community' }),
  }).then((r) => r.json());
  userBToken = loginB.token;

  // Register Community User C (Other Community)
  const emailC = `comm_c_${ts}@test.com`;
  testEmails.push(emailC);
  const regC = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Community User C',
      email: emailC,
      password: 'password123',
      role: 'community',
      communityId: COMM_B,
    }),
  }).then((r) => r.json());
  userCId = regC.user.id;

  const loginC = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: emailC, password: 'password123', role: 'community' }),
  }).then((r) => r.json());
  userCToken = loginC.token;

  // Register a Student
  const emailStudent = `stud_comm_${ts}@test.com`;
  testEmails.push(emailStudent);
  await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Student',
      email: emailStudent,
      password: 'password123',
      role: 'student',
      institutionId: 'INST-01',
    }),
  });
  const loginStudent = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: emailStudent, password: 'password123', role: 'student' }),
  }).then((r) => r.json());
  studentToken = loginStudent.token;

  // Register a Teacher
  const emailTeacher = `teach_comm_${ts}@test.com`;
  testEmails.push(emailTeacher);
  await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Teacher',
      email: emailTeacher,
      password: 'password123',
      role: 'teacher',
      institutionId: 'INST-01',
    }),
  });
  const loginTeacher = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: emailTeacher, password: 'password123', role: 'teacher' }),
  }).then((r) => r.json());
  teacherToken = loginTeacher.token;
});

after(async () => {
  if (testEmails.length > 0) {
    await User.deleteMany({ email: { $in: testEmails } });
  }
  if (createdActivityIds.length > 0) {
    await Activity.deleteMany({ _id: { $in: createdActivityIds } });
  }
  if (createdParticipationIds.length > 0) {
    await ActivityParticipation.deleteMany({ _id: { $in: createdParticipationIds } });
  }
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await mongoose.disconnect();
});

test('1. Community registration normalizes communityId and validates presence', async () => {
  // Missing communityId returns 400
  const badRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'No Comm User',
      email: `bad_comm_${Date.now()}@test.com`,
      password: 'password123',
      role: 'community',
      communityId: '',
    }),
  });
  assert.equal(badRes.status, 400);

  // User A communityId was normalized to uppercase trimmed
  const userA = await User.findById(userAId).lean();
  assert.equal(userA.communityId, 'MANGALORE-FITNESS');
});

test('2. Unauthenticated request to /api/community/profile returns 401', async () => {
  const res = await fetch(`${baseUrl}/api/community/profile`);
  assert.equal(res.status, 401);
});

test('3. Student and Teacher roles accessing /api/community/profile return 403', async () => {
  const studRes = await fetch(`${baseUrl}/api/community/profile`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  assert.equal(studRes.status, 403);

  const teachRes = await fetch(`${baseUrl}/api/community/profile`, {
    headers: { Authorization: `Bearer ${teacherToken}` },
  });
  assert.equal(teachRes.status, 403);
});

test('4. Community User A loads community profile with accurate stats', async () => {
  const res = await fetch(`${baseUrl}/api/community/profile`, {
    headers: { Authorization: `Bearer ${userAToken}` },
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.communityId, COMM_A);
  assert.equal(data.communityName, 'Mangalore Fitness');
  assert.equal(data.membersCount, 2); // User A and User B
  assert.equal(typeof data.myPoints, 'number');
  assert.equal(typeof data.myRank, 'number');
});

test('5. Community User A creates "7 Day Morning Run" challenge for MANGALORE-FITNESS', async () => {
  const payload = {
    title: '7 Day Morning Run',
    description: 'Run 5km every morning for 7 days with the Mangalore fitness community.',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 86400000),
    points: 100,
  };

  const res = await fetch(`${baseUrl}/api/community/challenges`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userAToken}`,
    },
    body: JSON.stringify(payload),
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.challenge.title, '7 Day Morning Run');
  assert.equal(data.challenge.communityId, COMM_A);
  assert.equal(data.challenge.points, 100);
  createdActivityIds.push(data.challenge.id);
});

test('6. Community User B (same community) sees the challenge and joins it', async () => {
  const getRes = await fetch(`${baseUrl}/api/community/challenges`, {
    headers: { Authorization: `Bearer ${userBToken}` },
  });
  assert.equal(getRes.status, 200);
  const data = await getRes.json();
  assert.equal(data.challenges.length, 1);
  assert.equal(data.challenges[0].title, '7 Day Morning Run');
  assert.equal(data.challenges[0].isJoined, false);

  const challengeId = data.challenges[0].id;

  // User B joins
  const joinRes = await fetch(`${baseUrl}/api/community/challenges/${challengeId}/join`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${userBToken}` },
  });
  assert.equal(joinRes.status, 201);
  const joinData = await joinRes.json();
  assert.equal(joinData.participation.pointsAwarded, 100);
  createdParticipationIds.push(joinData.participation.id);

  // User B verifies isJoined is now true
  const verifyRes = await fetch(`${baseUrl}/api/community/challenges`, {
    headers: { Authorization: `Bearer ${userBToken}` },
  });
  const verifyData = await verifyRes.json();
  assert.equal(verifyData.challenges[0].isJoined, true);
  assert.equal(verifyData.challenges[0].participantCount, 1);
});

test('7. Duplicate joining is prevented (409 Conflict)', async () => {
  const challengeId = createdActivityIds[0];
  const joinRes = await fetch(`${baseUrl}/api/community/challenges/${challengeId}/join`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${userBToken}` },
  });
  assert.equal(joinRes.status, 409);
});

test('8. User C (OTHER-COMMUNITY) cannot see MANGALORE-FITNESS challenge', async () => {
  const res = await fetch(`${baseUrl}/api/community/challenges`, {
    headers: { Authorization: `Bearer ${userCToken}` },
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.challenges.length, 0, 'User C must see 0 challenges from another community');
});

test('9. User C cannot join MANGALORE-FITNESS challenge via direct API request (403 Forbidden)', async () => {
  const challengeId = createdActivityIds[0];
  const joinRes = await fetch(`${baseUrl}/api/community/challenges/${challengeId}/join`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${userCToken}` },
  });
  assert.equal(joinRes.status, 403, 'Must reject joining challenge outside community');
});

test('10. Community leaderboard ranks members strictly within the same community', async () => {
  const resA = await fetch(`${baseUrl}/api/community/leaderboard`, {
    headers: { Authorization: `Bearer ${userAToken}` },
  });
  assert.equal(resA.status, 200);
  const dataA = await resA.json();

  assert.equal(dataA.communityId, COMM_A);
  assert.equal(dataA.leaderboard.length, 2);
  // User B joined the challenge (+100 pts) so User B should be rank 1
  assert.equal(dataA.leaderboard[0].name, 'Community User B');
  assert.equal(dataA.leaderboard[0].points, 100);
  assert.equal(dataA.leaderboard[0].rank, 1);

  // User C should NOT appear on MANGALORE-FITNESS leaderboard
  const hasUserC = dataA.leaderboard.some((u) => u.name === 'Community User C');
  assert.equal(hasUserC, false, 'User C from another community must not be on Community A leaderboard');
});

test('11. Community user can access shared personal fitness features (Nutrition, etc.)', async () => {
  const nutrRes = await fetch(`${baseUrl}/api/student/nutrition/today`, {
    headers: { Authorization: `Bearer ${userAToken}` },
  });
  assert.equal(nutrRes.status, 200);
  const nutrData = await nutrRes.json();
  assert.equal(nutrData.totals.calories, 0);
});
