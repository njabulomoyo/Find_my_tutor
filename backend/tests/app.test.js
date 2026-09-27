const path = require('node:path');
const fs = require('node:fs');

const TEST_DB_PATH = path.join(__dirname, 'tmp-app-http.db');
process.env.DB_PATH = TEST_DB_PATH;
process.env.NODE_ENV = 'test';

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
  assert.deepEqual(res.body.tutor.availability, [
    'Mon 8:00 AM - 9:00 AM',
    'Tue 11:00 AM - 12:00 PM',
    'Wed 8:00 AM - 9:00 AM',
    'Thu 11:00 AM - 12:00 PM',
  ]);
});

test('GET /api/tutors?subject= returns only tutors who teach that subject', async () => {
  const res = await request(app).get('/api/tutors?subject=calculus%20i');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body.tutors.map((tutor) => tutor.name).sort(), ['Adriel Dube', 'Maitaishe Mangudhla', 'Stecy Chirinda']);
});

test('GET /api/tutors/:id returns 404 for an unknown id', async () => {
  const res = await request(app).get('/api/tutors/999999');
  assert.equal(res.status, 404);
});

async function getSlots(subject, tutorId) {
  const res = await request(app).get('/api/slots').query(tutorId ? { subject, tutorId } : { subject });
  assert.equal(res.status, 200);
  return res.body.slots;
}

function bookingFor(slot, overrides = {}) {
  return {
    studentName: 'Aisha Ndlovu',
    email: 'aisha@example.com',
    tutorId: 2,
    subject: 'Calculus II',
    date: slot.date,
    start: slot.start,
    ...overrides,
  };
}

test('GET /api/slots lists open times across tutors who teach the subject', async () => {
  const slots = await getSlots('Probability and Statistics');
  assert.ok(slots.length > 0);

  for (const slot of slots) {
    assert.match(slot.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(slot.start, /^\d{2}:\d{2}$/);
    assert.ok(slot.dateLabel && slot.timeLabel);
    assert.ok(slot.tutors.length > 0);
    assert.ok(slot.tutors.every((tutor) => [1, 2, 4].includes(tutor.id)));
  }
});

test('GET /api/slots can be limited to one tutor', async () => {
  const slots = await getSlots('Probability and Statistics', 2);
  assert.ok(slots.length > 0);
  assert.ok(slots.every((slot) => slot.tutors.length === 1 && slot.tutors[0].name === 'Enoch Owoade'));
});

test('GET /api/slots requires a subject', async () => {
  const res = await request(app).get('/api/slots');
  assert.equal(res.status, 400);
});

test('POST /api/bookings books an open slot and it cannot be booked twice', async () => {
  const [slot] = await getSlots('Calculus II', 2);

  const res = await request(app).post('/api/bookings').send(bookingFor(slot, { email: 'first@example.com' }));
  assert.equal(res.status, 201);
  assert.equal(res.body.booking.tutorName, 'Enoch Owoade');
  assert.equal(res.body.booking.sessionDate, slot.date);
  assert.equal(res.body.booking.startTime, slot.start);
  assert.equal(res.body.booking.endTime, slot.end);

  const remaining = await getSlots('Calculus II', 2);
  assert.ok(!remaining.some((open) => open.date === slot.date && open.start === slot.start));

  const again = await request(app).post('/api/bookings').send(bookingFor(slot, { email: 'second@example.com' }));
  assert.equal(again.status, 409);
  assert.match(again.body.message, /no longer available/);
});

test('POST /api/bookings with "any" assigns one of the free tutors', async () => {
  const slot = (await getSlots('Probability and Statistics')).find((open) => open.tutors.length >= 2);
  assert.ok(slot, 'expected a time with at least two free tutors');

  const res = await request(app).post('/api/bookings').send(bookingFor(slot, {
    email: 'any@example.com',
    subject: 'Probability and Statistics',
    tutorId: 'any',
  }));
  assert.equal(res.status, 201);

  const assignedId = res.body.booking.tutorId;
  assert.ok(slot.tutors.some((tutor) => tutor.id === assignedId));

  const after = (await getSlots('Probability and Statistics'))
    .find((open) => open.date === slot.date && open.start === slot.start);
  assert.ok(after, 'the other tutor should still be free at that time');
  assert.ok(!after.tutors.some((tutor) => tutor.id === assignedId));
});

test('POST /api/bookings rejects a subject the tutor does not teach', async () => {
  const [slot] = await getSlots('Calculus II', 2);
  const res = await request(app).post('/api/bookings').send(bookingFor(slot, { email: 'wrong@example.com', tutorId: 1 }));
  assert.equal(res.status, 400);
  assert.match(res.body.message, /does not tutor Calculus II/);
});

test('POST /api/bookings rejects a time outside the tutor\'s availability', async () => {
  const [slot] = await getSlots('Calculus II', 2);
  const res = await request(app).post('/api/bookings').send(bookingFor({ date: slot.date, start: '03:00' }, { email: 'night@example.com' }));
  assert.equal(res.status, 409);
});

test('POST /api/bookings rejects a student booking two sessions at the same time', async () => {
  const [slot] = await getSlots('Calculus II', 2);
  const first = await request(app).post('/api/bookings').send(bookingFor(slot, { email: 'twice@example.com' }));
  assert.equal(first.status, 201);

  const second = await request(app).post('/api/bookings').send(bookingFor(slot, {
    email: 'twice@example.com',
    subject: 'Probability and Statistics',
    tutorId: 'any',
  }));
  assert.equal(second.status, 409);
  assert.match(second.body.message, /already have a session/);
});

test('POST /api/bookings allows at most 4 sessions per student per day', async () => {
  const slots = await getSlots('Calculus II', 2);
  const byDate = new Map();
  slots.forEach((slot) => byDate.set(slot.date, [...(byDate.get(slot.date) || []), slot]));
  const daySlots = [...byDate.values()].find((list) => list.length >= 5);
  assert.ok(daySlots, 'expected a day with at least five open slots');

  for (const slot of daySlots.slice(0, 4)) {
    const res = await request(app).post('/api/bookings').send(bookingFor(slot, { email: 'busy@example.com' }));
    assert.equal(res.status, 201);
  }

  const fifth = await request(app).post('/api/bookings').send(bookingFor(daySlots[4], { email: 'busy@example.com' }));
  assert.equal(fifth.status, 409);
  assert.match(fifth.body.message, /at most 4 sessions per day/);
});

test('POST /api/bookings rejects a request missing required fields', async () => {
  const res = await request(app).post('/api/bookings').send({ studentName: 'A' });
  assert.equal(res.status, 400);
});
