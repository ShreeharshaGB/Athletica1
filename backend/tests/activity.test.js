import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Activity from '../src/models/Activity.js';
import ActivityParticipation from '../src/models/ActivityParticipation.js';
import connectDB from '../src/config/database.js';
import jwt from 'jsonwebtoken';

let server;
let baseUrl;
const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY || 'testsecret';

let teacherA;
let teacherAToken;
let studentA;
let studentAToken;
let studentB;
let studentBToken;
let studentC;
let studentCToken;
let createdActivityId;

before(async () => {
  await connectDB();

  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });

  const ts = Date.now();

  // Teacher A: COLLEGE-001
  teacherA = await User.create({
    name: 'Teacher A',
    email: `teachera_${ts}@test.com`,
    password: 'password123',
    role: 'teacher',
    institutionId: 'COLLEGE-001',
  });
  teacherAToken = jwt.sign({ id: teacherA._id.toString(), role: 'teacher' }, secret, {
    expiresIn: '1h',
  });

  // Student A: COLLEGE-001
  studentA = await User.create({
    name: 'Student A',
    email: `studenta_${ts}@test.com`,
    password: 'password123',
    role: 'student',
    institutionId: 'COLLEGE-001',
  });
  studentAToken = jwt.sign({ id: studentA._id.toString(), role: 'student' }, secret, {
    expiresIn: '1h',
  });

  // Student B: COLLEGE-001
  studentB = await User.create({
    name: 'Student B',
    email: `studentb_${ts}@test.com`,
    password: 'password123',
    role: 'student',
    institutionId: 'COLLEGE-001',
  });
  studentBToken = jwt.sign({ id: studentB._id.toString(), role: 'student' }, secret, {
    expiresIn: '1h',
  });

  // Student C: COLLEGE-002
  studentC = await User.create({
    name: 'Student C',
    email: `studentc_${ts}@test.com`,
    password: 'password123',
    role: 'student',
    institutionId: 'COLLEGE-002',
  });
  studentCToken = jwt.sign({ id: studentC._id.toString(), role: 'student' }, secret, {
    expiresIn: '1h',
  });
});

after(async () => {
  const userIds = [teacherA?._id, studentA?._id, studentB?._id, studentC?._id].filter(Boolean);
  if (userIds.length > 0) {
    await User.deleteMany({ _id: { $in: userIds } });
  }
  if (createdActivityId) {
    await Activity.deleteOne({ _id: createdActivityId });
    await ActivityParticipation.deleteMany({ activityId: createdActivityId });
  }
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  const mongoose = (await import('mongoose')).default;
  await mongoose.disconnect();
});

test('1. Teacher creates activity and it inherits teacher institutionId COLLEGE-001', async () => {
  const tomorrow = new Date(Date.now() + 86400000);
  const nextWeek = new Date(Date.now() + 7 * 86400000);

  const res = await fetch(`${baseUrl}/api/teacher/activities`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${teacherAToken}`,
    },
    body: JSON.stringify({
      title: '10K Steps Challenge',
      description: 'Complete 10,000 steps per day for improved stamina.',
      type: 'challenge',
      startDate: tomorrow.toISOString(),
      endDate: nextWeek.toISOString(),
      points: 50,
    }),
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.ok(data.activity);
  assert.equal(data.activity.title, '10K Steps Challenge');
  assert.equal(data.activity.institutionId, 'COLLEGE-001');
  assert.equal(data.activity.points, 50);
  assert.equal(data.activity.participantCount, 0);

  createdActivityId = data.activity.id;
});

test('2. Student A (COLLEGE-001) sees the activity', async () => {
  const res = await fetch(`${baseUrl}/api/student/activities`, {
    headers: {
      Authorization: `Bearer ${studentAToken}`,
    },
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.activities));
  const found = data.activities.find((a) => a.id === createdActivityId);
  assert.ok(found, 'Student A must see COLLEGE-001 activity');
  assert.equal(found.hasJoined, false);
});

test('3. Student A joins the activity and receives points', async () => {
  const res = await fetch(`${baseUrl}/api/student/activities/${createdActivityId}/join`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${studentAToken}`,
    },
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.ok(data.participation);
  assert.equal(data.participation.pointsAwarded, 50);

  // Verify participation in DB
  const p = await ActivityParticipation.findOne({
    activityId: createdActivityId,
    studentId: studentA._id,
  });
  assert.ok(p);
  assert.equal(p.institutionId, 'COLLEGE-001');
});

test('4. Student A cannot join the same activity twice', async () => {
  const res = await fetch(`${baseUrl}/api/student/activities/${createdActivityId}/join`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${studentAToken}`,
    },
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.ok(data.message.includes('already joined'));
});

test('5. Student C (COLLEGE-002) must NOT see COLLEGE-001 activity', async () => {
  const res = await fetch(`${baseUrl}/api/student/activities`, {
    headers: {
      Authorization: `Bearer ${studentCToken}`,
    },
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  const found = data.activities.find((a) => a.id === createdActivityId);
  assert.equal(found, undefined, 'Student C must NOT see activity from COLLEGE-001');
});

test('6. Student C must NOT be able to join COLLEGE-001 activity directly', async () => {
  const res = await fetch(`${baseUrl}/api/student/activities/${createdActivityId}/join`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${studentCToken}`,
    },
  });

  assert.equal(res.status, 403);
  const data = await res.json();
  assert.ok(data.message.includes('own institution'));
});

test('7. Teacher A sees participant count incremented to 1', async () => {
  const res = await fetch(`${baseUrl}/api/teacher/activities`, {
    headers: {
      Authorization: `Bearer ${teacherAToken}`,
    },
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  const found = data.activities.find((a) => a.id === createdActivityId);
  assert.ok(found);
  assert.equal(found.participantCount, 1);
});

test('8. Student A sees joined status in GET /api/student/activities/joined', async () => {
  const res = await fetch(`${baseUrl}/api/student/activities/joined`, {
    headers: {
      Authorization: `Bearer ${studentAToken}`,
    },
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.joinedActivities));
  assert.equal(data.joinedActivities.length, 1);
  assert.equal(data.joinedActivities[0].title, '10K Steps Challenge');
  assert.equal(data.joinedActivities[0].pointsAwarded, 50);
});
