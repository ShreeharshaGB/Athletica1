import assert from 'node:assert/strict';
import { test, before, after } from 'node:test';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import app from '../src/app.js';
import connectDB from '../src/config/database.js';
import User from '../src/models/User.js';
import AnalyzedMeal from '../src/models/AnalyzedMeal.js';

let server;
let baseUrl;
const testEmails = [];
const createdMealIds = [];

let student1Token;
let student1Id;
let student2Token;
let student2Id;
let teacherToken;

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
  const instId = `NUTR-INST-${ts}`;

  // Register Student 1
  const s1Email = `nutr_s1_${ts}@test.com`;
  testEmails.push(s1Email);
  const s1Reg = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Nutrition Student 1',
      email: s1Email,
      password: 'password123',
      role: 'student',
      institutionId: instId,
    }),
  }).then((r) => r.json());
  student1Id = s1Reg.user.id;

  const s1Login = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: s1Email, password: 'password123', role: 'student' }),
  }).then((r) => r.json());
  student1Token = s1Login.token;

  // Register Student 2
  const s2Email = `nutr_s2_${ts}@test.com`;
  testEmails.push(s2Email);
  const s2Reg = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Nutrition Student 2',
      email: s2Email,
      password: 'password123',
      role: 'student',
      institutionId: instId,
    }),
  }).then((r) => r.json());
  student2Id = s2Reg.user.id;

  const s2Login = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: s2Email, password: 'password123', role: 'student' }),
  }).then((r) => r.json());
  student2Token = s2Login.token;

  // Register Teacher
  const tEmail = `nutr_teacher_${ts}@test.com`;
  testEmails.push(tEmail);
  await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Nutrition Coach',
      email: tEmail,
      password: 'password123',
      role: 'teacher',
      institutionId: instId,
    }),
  });

  const tLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: tEmail, password: 'password123', role: 'teacher' }),
  }).then((r) => r.json());
  teacherToken = tLogin.token;
});

after(async () => {
  if (testEmails.length > 0) {
    await User.deleteMany({ email: { $in: testEmails } });
  }
  if (createdMealIds.length > 0) {
    await AnalyzedMeal.deleteMany({ _id: { $in: createdMealIds } });
  }

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

test('1. Unauthenticated request to /api/student/nutrition/today returns 401', async () => {
  const res = await fetch(`${baseUrl}/api/student/nutrition/today`);
  assert.equal(res.status, 401);
});

test('2. Teacher role accessing /api/student/nutrition/today returns 403', async () => {
  const res = await fetch(`${baseUrl}/api/student/nutrition/today`, {
    headers: { Authorization: `Bearer ${teacherToken}` },
  });
  assert.equal(res.status, 403);
});

test('3. POST /api/student/nutrition/analyze without image returns 400', async () => {
  const res = await fetch(`${baseUrl}/api/student/nutrition/analyze`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${student1Token}` },
  });
  assert.equal(res.status, 400);
});

test('4. POST /api/student/nutrition/analyze with invalid image format returns 400', async () => {
  const boundary = '----WebKitFormBoundaryFakeNutrition';
  const body =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="image"; filename="fake.jpg"\r\n` +
    `Content-Type: image/jpeg\r\n\r\n` +
    `NOT_REAL_JPEG_MAGIC_BYTES_TEXT\r\n` +
    `--${boundary}--\r\n`;

  const res = await fetch(`${baseUrl}/api/student/nutrition/analyze`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${student1Token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body,
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.ok(data.message.includes('Invalid image content'));
});

test('5. GET /api/student/nutrition/today with no meals returns zeroed totals', async () => {
  const res = await fetch(`${baseUrl}/api/student/nutrition/today`, {
    headers: { Authorization: `Bearer ${student1Token}` },
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.totals.calories, 0);
  assert.equal(data.totals.protein, 0);
  assert.equal(data.totals.carbs, 0);
  assert.equal(data.totals.fat, 0);
  assert.equal(data.totals.mealsCount, 0);
});

test('6. Student 1 saves meal: today totals calculate and meals list updates', async () => {
  const meal = await AnalyzedMeal.create({
    userId: student1Id,
    foods: [
      {
        name: 'Neer Dosa',
        estimatedPortion: '2 pieces',
        estimatedCalories: 180,
        proteinGrams: 4,
        carbsGrams: 34,
        fatGrams: 4,
      },
      {
        name: 'Chicken Curry',
        estimatedPortion: '1 bowl',
        estimatedCalories: 340,
        proteinGrams: 24,
        carbsGrams: 8,
        fatGrams: 22,
      },
    ],
    totalEstimatedCalories: 520,
    totalProteinGrams: 28,
    totalCarbsGrams: 42,
    totalFatGrams: 26,
    summary: 'Balanced protein-carbohydrate recovery meal.',
    confidence: 'high',
    mealType: 'Lunch',
    analyzedAt: new Date(),
  });
  createdMealIds.push(meal._id);

  // Check today endpoint
  const todayRes = await fetch(`${baseUrl}/api/student/nutrition/today`, {
    headers: { Authorization: `Bearer ${student1Token}` },
  });
  assert.equal(todayRes.status, 200);
  const todayData = await todayRes.json();
  assert.equal(todayData.totals.calories, 520);
  assert.equal(todayData.totals.protein, 28);
  assert.equal(todayData.totals.carbs, 42);
  assert.equal(todayData.totals.fat, 26);
  assert.equal(todayData.totals.mealsCount, 1);

  // Check meals list
  const mealsRes = await fetch(`${baseUrl}/api/student/nutrition/meals`, {
    headers: { Authorization: `Bearer ${student1Token}` },
  });
  assert.equal(mealsRes.status, 200);
  const mealsData = await mealsRes.json();
  assert.equal(mealsData.meals.length, 1);
  assert.equal(mealsData.meals[0].foods.length, 2);
  assert.equal(mealsData.meals[0].foods[0].name, 'Neer Dosa');
});

test('7. Privacy Isolation: Student 2 cannot see Student 1 meals or image', async () => {
  // Student 2 gets meals
  const res2 = await fetch(`${baseUrl}/api/student/nutrition/meals`, {
    headers: { Authorization: `Bearer ${student2Token}` },
  });
  assert.equal(res2.status, 200);
  const data2 = await res2.json();
  assert.equal(data2.meals.length, 0, 'Student 2 must NOT see Student 1 meals');

  // Student 2 tries to access Student 1 meal image
  const imgRes = await fetch(`${baseUrl}/api/student/nutrition/image/${createdMealIds[0]}`, {
    headers: { Authorization: `Bearer ${student2Token}` },
  });
  assert.equal(imgRes.status, 404, 'Must return 404 access denied for unauthorized student');
});

test('8. POST /api/student/nutrition/log-curated: logs curated meal directly without Gemini and scales with servings', async () => {
  const curatedPayload = {
    name: 'Pesarattu',
    estimatedPortion: '2 crepes with ginger chutney',
    servings: 2,
    region: 'South India',
    diet: 'Vegetarian',
    nutrition: {
      calories: 260,
      protein: 14,
      carbs: 42,
      fat: 4,
    },
  };

  const res = await fetch(`${baseUrl}/api/student/nutrition/log-curated`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${student1Token}`,
    },
    body: JSON.stringify(curatedPayload),
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.isIdentified, true);
  assert.equal(data.meal.totalEstimatedCalories, 520); // 260 * 2
  assert.equal(data.meal.totalProteinGrams, 28); // 14 * 2
  assert.equal(data.meal.totalCarbsGrams, 84); // 42 * 2
  assert.equal(data.meal.totalFatGrams, 8); // 4 * 2
  assert.equal(data.meal.foods[0].name, 'Pesarattu');
  assert.equal(data.meal.confidence, 'high');
  createdMealIds.push(data.meal.id);

  // Verify today totals now include both meals (520 + 520 = 1040)
  const todayRes = await fetch(`${baseUrl}/api/student/nutrition/today`, {
    headers: { Authorization: `Bearer ${student1Token}` },
  });
  assert.equal(todayRes.status, 200);
  const todayData = await todayRes.json();
  assert.equal(todayData.totals.calories, 1040);
  assert.equal(todayData.totals.mealsCount, 2);
});

test('9. POST /api/student/nutrition/describe: validates empty description returns 400', async () => {
  const res = await fetch(`${baseUrl}/api/student/nutrition/describe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${student1Token}`,
    },
    body: JSON.stringify({ description: '   ' }),
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.match(data.message, /description/i);
});

