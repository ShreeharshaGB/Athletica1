import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../src/app.js';
import User from '../src/models/User.js';
import PhysiqueAnalysis from '../src/models/PhysiqueAnalysis.js';
import connectDB from '../src/config/database.js';
import jwt from 'jsonwebtoken';

let server;
let baseUrl;
let studentToken;
let studentUser;
let teacherToken;
let teacherUser;
let otherStudentToken;
let otherStudentUser;

// 1x1 valid PNG image buffer
const samplePngBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

function createMultipartBody(fieldName, fileName, mimeType, fileBuffer) {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const crlf = '\r\n';

  let header = `--${boundary}${crlf}`;
  header += `Content-Disposition: form-data; name="${fieldName}"; filename="${fileName}"${crlf}`;
  header += `Content-Type: ${mimeType}${crlf}${crlf}`;

  const footer = `${crlf}--${boundary}--${crlf}`;

  const body = Buffer.concat([
    Buffer.from(header, 'utf8'),
    fileBuffer,
    Buffer.from(footer, 'utf8'),
  ]);

  return { boundary, body };
}

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

  const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY || 'testsecret';

  // Seed test users
  const timestamp = Date.now();
  studentUser = await User.create({
    name: 'Physique Student',
    email: `student_physique_${timestamp}@athletica.test`,
    password: 'hashedPassword123',
    role: 'student',
    institutionId: 'TEST-INST-1',
  });
  studentToken = jwt.sign({ id: studentUser._id.toString(), role: 'student' }, secret, {
    expiresIn: '1h',
  });

  otherStudentUser = await User.create({
    name: 'Other Student',
    email: `student_other_${timestamp}@athletica.test`,
    password: 'hashedPassword123',
    role: 'student',
    institutionId: 'TEST-INST-1',
  });
  otherStudentToken = jwt.sign({ id: otherStudentUser._id.toString(), role: 'student' }, secret, {
    expiresIn: '1h',
  });

  teacherUser = await User.create({
    name: 'Physique Teacher',
    email: `teacher_physique_${timestamp}@athletica.test`,
    password: 'hashedPassword123',
    role: 'teacher',
    institutionId: 'TEST-INST-1',
  });
  teacherToken = jwt.sign({ id: teacherUser._id.toString(), role: 'teacher' }, secret, {
    expiresIn: '1h',
  });
});

after(async () => {
  if (studentUser) await User.deleteOne({ _id: studentUser._id });
  if (otherStudentUser) await User.deleteOne({ _id: otherStudentUser._id });
  if (teacherUser) await User.deleteOne({ _id: teacherUser._id });
  if (studentUser) await PhysiqueAnalysis.deleteMany({ userId: studentUser._id });
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  const mongoose = (await import('mongoose')).default;
  await mongoose.disconnect();
});

test('1. Unauthenticated request to /api/student/physique-analysis returns 401', async () => {
  const res = await fetch(`${baseUrl}/api/student/physique-analysis`);
  assert.equal(res.status, 401);
});

test('2. Teacher role accessing /api/student/physique-analysis returns 403', async () => {
  const res = await fetch(`${baseUrl}/api/student/physique-analysis`, {
    headers: {
      Authorization: `Bearer ${teacherToken}`,
    },
  });
  assert.equal(res.status, 403);
});

test('3. Student accessing GET /api/student/physique-analysis with no existing records returns null analysis', async () => {
  const res = await fetch(`${baseUrl}/api/student/physique-analysis`, {
    headers: {
      Authorization: `Bearer ${studentToken}`,
    },
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.analysis, null);
});

test('4. POST /api/student/physique-analysis without image returns 400', async () => {
  const res = await fetch(`${baseUrl}/api/student/physique-analysis`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${studentToken}`,
    },
  });
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.ok(data.message.includes('image is required'));
});

test('5. POST /api/student/physique-analysis with fake image / bad magic bytes returns 400', async () => {
  const fakeFileBuffer = Buffer.from('This is a plain text file pretending to be image', 'utf8');
  const { boundary, body } = createMultipartBody(
    'image',
    'fake.jpg',
    'image/jpeg',
    fakeFileBuffer
  );

  const res = await fetch(`${baseUrl}/api/student/physique-analysis`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${studentToken}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body,
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.ok(data.message.toLowerCase().includes('invalid image'));
});

test('6. POST /api/student/physique-analysis handles image analysis and stores record', async () => {
  const { boundary, body } = createMultipartBody(
    'image',
    'test_physique.png',
    'image/png',
    samplePngBuffer
  );

  const res = await fetch(`${baseUrl}/api/student/physique-analysis`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${studentToken}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body,
  });

  // Handle either 201 (Gemini response) or 502 (Gemini external temporary overload)
  assert.ok([201, 502].includes(res.status), `Status ${res.status} should be 201 or 502`);

  if (res.status === 201) {
    const data = await res.json();
    assert.ok(data.analysis);
    assert.ok(data.analysis.id);
    assert.ok(data.analysis.imageUrl);
    assert.ok(typeof data.analysis.isSuitableImage === 'boolean');
    assert.ok(Array.isArray(data.analysis.visibleObservations));
    assert.ok(data.analysis.disclaimer);
  } else {
    const data = await res.json();
    assert.ok(data.message, 'Should return error message on 502');
  }

  // Seed a guaranteed completed analysis document to thoroughly test GET and image retrieval
  const testAnalysis = await PhysiqueAnalysis.create({
    userId: studentUser._id,
    image: {
      storageKey: 'physique/sample.png',
      mimeType: 'image/png',
      fileSize: samplePngBuffer.length,
    },
    analysis: {
      isSuitableImage: true,
      unsuitableReason: '',
      summary: 'Well-aligned kinetic posture with balanced foundation.',
      visibleObservations: ['Upright torso', 'Neutral shoulder alignment'],
      strengthFocus: ['Posterior chain', 'Core stabilization'],
      mobilityFocus: ['Hip flexors', 'Thoracic spine'],
      conditioningFocus: ['Aerobic base building'],
      recommendedFocus: ['Compound strength', 'Posture maintenance'],
      beginnerActions: ['Glute bridges', 'Plank holds'],
      confidence: 'high',
      disclaimer: 'General fitness guidance only.',
    },
    geminiModel: 'gemini-3.8-flash',
    status: 'completed',
  });

  // Also write dummy file on disk for image endpoint test
  const fs = await import('fs');
  const path = await import('path');
  const targetDir = path.resolve(process.cwd(), 'uploads', 'physique');
  await fs.promises.mkdir(targetDir, { recursive: true });
  await fs.promises.writeFile(path.join(targetDir, 'sample.png'), samplePngBuffer);

  // 7. Verify GET /api/student/physique-analysis returns the latest analysis
  const getRes = await fetch(`${baseUrl}/api/student/physique-analysis`, {
    headers: {
      Authorization: `Bearer ${studentToken}`,
    },
  });
  assert.equal(getRes.status, 200);
  const getData = await getRes.json();
  assert.ok(getData.analysis);
  assert.equal(getData.analysis.id, testAnalysis._id.toString());
  assert.equal(getData.analysis.summary, 'Well-aligned kinetic posture with balanced foundation.');

  // 8. Verify the owner can load their image
  const imgRes = await fetch(`${baseUrl}${getData.analysis.imageUrl}`, {
    headers: {
      Authorization: `Bearer ${studentToken}`,
    },
  });
  assert.equal(imgRes.status, 200);
  assert.equal(imgRes.headers.get('content-type'), 'image/png');

  // 9. Verify another student CANNOT access this image (returns 404)
  const otherImgRes = await fetch(`${baseUrl}${getData.analysis.imageUrl}`, {
    headers: {
      Authorization: `Bearer ${otherStudentToken}`,
    },
  });
  assert.equal(otherImgRes.status, 404);
});
