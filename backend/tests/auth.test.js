import assert from 'node:assert/strict';
import { test, before, after } from 'node:test';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import app from '../src/app.js';
import connectDB from '../src/config/database.js';
import User from '../src/models/User.js';

let server;
let baseUrl;
const testEmails = [];

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
});

after(async () => {
  // Clean up created test users
  if (testEmails.length > 0) {
    await User.deleteMany({ email: { $in: testEmails } });
  }

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

test('A. Register Student A with COLLEGE-001', async () => {
  const email = `test_student_a_${Date.now()}@example.com`;
  testEmails.push(email);

  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Student A',
      email,
      password: 'password123',
      role: 'student',
      institutionId: '  college-001  ' // tests normalization (trim and uppercase)
    }),
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.user.name, 'Student A');
  assert.equal(data.user.email, email);
  assert.equal(data.user.role, 'student');
  assert.equal(data.user.institutionId, 'COLLEGE-001');
  assert.equal(data.user.password, undefined);
  assert.equal(data.user.passwordHash, undefined);
});

test('B. Register Student B with COLLEGE-001', async () => {
  const email = `test_student_b_${Date.now()}@example.com`;
  testEmails.push(email);

  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Student B',
      email,
      password: 'password123',
      role: 'student',
      institutionId: 'COLLEGE-001'
    }),
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.user.name, 'Student B');
  assert.equal(data.user.email, email);
  assert.equal(data.user.role, 'student');
  assert.equal(data.user.institutionId, 'COLLEGE-001');
  assert.equal(data.user.password, undefined);
});

test('C. Register Student C with COLLEGE-002', async () => {
  const email = `test_student_c_${Date.now()}@example.com`;
  testEmails.push(email);

  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Student C',
      email,
      password: 'password123',
      role: 'student',
      institutionId: 'college-002'
    }),
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.user.name, 'Student C');
  assert.equal(data.user.email, email);
  assert.equal(data.user.role, 'student');
  assert.equal(data.user.institutionId, 'COLLEGE-002');
  assert.equal(data.user.password, undefined);
});

test('D. Register Teacher A with COLLEGE-001', async () => {
  const email = `test_teacher_a_${Date.now()}@example.com`;
  testEmails.push(email);

  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Teacher A',
      email,
      password: 'password123',
      role: 'teacher',
      institutionId: 'COLLEGE-001'
    }),
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.user.name, 'Teacher A');
  assert.equal(data.user.email, email);
  assert.equal(data.user.role, 'teacher');
  assert.equal(data.user.institutionId, 'COLLEGE-001');
  assert.equal(data.user.password, undefined);
});

test('E. Login as registered accounts and verify tokens & user info', async () => {
  for (const email of testEmails) {
    const isTeacher = email.includes('teacher');
    const role = isTeacher ? 'teacher' : 'student';

    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: 'password123',
        role
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.token, 'Token must be present');
    assert.equal(data.user.email, email);
    assert.equal(data.user.role, role);
    assert.ok(data.user.institutionId, 'institutionId must be returned');
    assert.equal(data.user.password, undefined);
    assert.equal(data.user.passwordHash, undefined);
  }
});

test('F. Duplicate email registration returns 409', async () => {
  const existingEmail = testEmails[0];

  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Duplicate User',
      email: existingEmail,
      password: 'password123',
      role: 'student',
      institutionId: 'COLLEGE-001'
    }),
  });

  assert.equal(res.status, 409);
  const data = await res.json();
  assert.match(data.message, /already registered/i);
});

test('G. Wrong password login returns 401', async () => {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmails[0],
      password: 'wrongpassword',
      role: 'student'
    }),
  });

  assert.equal(res.status, 401);
  const data = await res.json();
  assert.match(data.message, /invalid/i);
});

test('H. Missing institutionId for student/teacher returns 400', async () => {
  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'No Institution Student',
      email: `no_inst_${Date.now()}@example.com`,
      password: 'password123',
      role: 'student'
    }),
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.match(data.message, /institution/i);
});

test('I. Existing user without institutionId logs in safely via API', async () => {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'student_test_1790321033367@example.com',
      password: 'password123',
      role: 'student'
    }),
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.token, 'Token must be returned');
  assert.equal(data.user.email, 'student_test_1790321033367@example.com');
  assert.equal(data.user.institutionId, null, 'institutionId should be null for legacy users');
  assert.equal(data.user.password, undefined);
  assert.equal(data.user.passwordHash, undefined);
});
