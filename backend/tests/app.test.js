const path = require('node:path');
const fs = require('node:fs');

const TEST_DB_PATH = path.join(__dirname, 'tmp-app-http.db');
process.env.DB_PATH = TEST_DB_PATH;

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createApp } = require('../src/app');
const { initializeDatabase } = require('../src/db');

const app = createApp();

before(async () => {
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }
  await initializeDatabase();
});

after(() => {
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }
});

test('GET /api/tutors returns the seeded tutors', async () => {
  const res = await request(app).get('/api/tutors');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.tutors) && res.body.tutors.length > 0);
  assert.ok(res.body.tutors.some((tutor) => tutor.name === 'Adriel Dube'));
  assert.ok(res.body.tutors.every((tutor) => tutor.email === undefined));
});

test('GET /api/tutors/:id returns the matching tutor', async () => {
  const res = await request(app).get('/api/tutors/1');
  assert.equal(res.status, 200);
  assert.equal(res.body.tutor.name, 'Adriel Dube');
  assert.equal(res.body.tutor.major, 'Computer Science & Cloud Computing');
  assert.equal(res.body.tutor.email, undefined);
});

test('GET /api/tutors/:id returns 404 for an unknown id', async () => {
  const res = await request(app).get('/api/tutors/999999');
  assert.equal(res.status, 404);
});

test('POST /api/bookings creates a booking for a valid request', async () => {
  const res = await request(app).post('/api/bookings').send({
    studentName: 'Aisha Ndlovu',
    email: 'aisha@example.com',
    tutorId: 1,
    preferredDate: '2026-09-12',
    subject: 'Physics',
  });
  assert.equal(res.status, 201);
  assert.equal(res.body.booking.studentName, 'Aisha Ndlovu');
  assert.equal(res.body.booking.tutorName, 'Adriel Dube');
});

test('POST /api/bookings rejects a request missing required fields', async () => {
  const res = await request(app).post('/api/bookings').send({ studentName: 'A' });
  assert.equal(res.status, 400);
});
