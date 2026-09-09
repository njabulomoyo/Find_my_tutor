const test = require('node:test');
const assert = require('node:assert/strict');
const { validateBooking } = require('../src/bookingService');

test('accepts a valid booking request', () => {
  const booking = {
    studentName: 'Aisha Ndlovu',
    email: 'aisha@student.gsu.edu',
    tutorId: 1,
    preferredDate: '2026-09-12',
    subject: 'Physics',
    message: 'I need support with kinematics.'
  };

  const result = validateBooking(booking);

  assert.deepEqual(result, {
    studentName: 'Aisha Ndlovu',
    email: 'aisha@student.gsu.edu',
    tutorId: 1,
    preferredDate: '2026-09-12',
    subject: 'Physics',
    message: 'I need support with kinematics.'
  });
});

test('rejects booking requests missing required fields', () => {
  assert.throws(() => {
    validateBooking({
      studentName: 'Aisha Ndlovu',
      email: 'aisha@student.gsu.edu',
      tutorId: 1,
      subject: 'Physics'
    });
  }, /Required fields/);
});

test('rejects invalid email addresses', () => {
  assert.throws(() => {
    validateBooking({
      studentName: 'Aisha Ndlovu',
      email: 'not-an-email',
      tutorId: 1,
      preferredDate: '2026-09-12',
      subject: 'Physics'
    });
  }, /valid email/);
});
