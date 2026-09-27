const test = require('node:test');
const assert = require('node:assert/strict');
const { validateBooking } = require('../src/bookingService');

const validRequest = {
  studentName: 'Aisha Ndlovu',
  email: 'Aisha@Student.gsu.edu',
  tutorId: 1,
  subject: 'Calculus I',
  date: '2026-09-28',
  start: '10:30',
  message: 'I need support with derivatives.',
};

test('accepts a valid booking request', () => {
  assert.deepEqual(validateBooking(validRequest), {
    studentName: 'Aisha Ndlovu',
    email: 'aisha@student.gsu.edu',
    tutorId: 1,
    subject: 'Calculus I',
    date: '2026-09-28',
    start: '10:30',
    message: 'I need support with derivatives.',
  });
});

test('accepts "any" as the tutor', () => {
  assert.equal(validateBooking({ ...validRequest, tutorId: 'any' }).tutorId, 'any');
});

test('rejects booking requests missing required fields', () => {
  const { start, ...withoutStart } = validRequest;
  assert.throws(() => validateBooking(withoutStart), /Required fields are missing: start/);
});

test('rejects invalid email addresses', () => {
  assert.throws(() => validateBooking({ ...validRequest, email: 'not-an-email' }), /valid email/);
});

test('rejects an invalid tutor id', () => {
  assert.throws(() => validateBooking({ ...validRequest, tutorId: 'abc' }), /Tutor selection is invalid/);
});

test('rejects invalid dates and times', () => {
  assert.throws(() => validateBooking({ ...validRequest, date: '2026-02-30' }), /valid YYYY-MM-DD/);
  assert.throws(() => validateBooking({ ...validRequest, date: 'next Monday' }), /valid YYYY-MM-DD/);
  assert.throws(() => validateBooking({ ...validRequest, start: '10:30 AM' }), /HH:MM/);
  assert.throws(() => validateBooking({ ...validRequest, start: '25:00' }), /HH:MM/);
});
