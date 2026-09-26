const test = require('node:test');
const assert = require('node:assert/strict');
const { composeStudentEmail, composeTutorEmail } = require('../src/email/content');

const booking = {
  id: 42,
  studentName: 'Aisha Ndlovu',
  email: 'aisha@example.com',
  subject: 'Calculus I',
  preferredDate: '2026-10-01',
  preferredTime: '2:00 PM',
  message: 'Need help with derivatives',
  createdAt: '2026-09-25T12:00:00.000Z',
};

const tutor = {
  id: 1,
  name: 'Adriel Dube',
  email: 'adriel.dube@example.com',
};

test('composeStudentEmail addresses the student and includes booking details', () => {
  const message = composeStudentEmail({ booking, tutor });

  assert.equal(message.to, booking.email);
  assert.match(message.subject, /Adriel Dube/);
  assert.match(message.text, /Aisha Ndlovu/);
  assert.match(message.text, /Adriel Dube/);
  assert.match(message.text, /Calculus I/);
  assert.match(message.text, /2026-10-01/);
  assert.match(message.text, /2:00 PM/);
  assert.match(message.text, /Need help with derivatives/);
  assert.match(message.text, /#42/);
});

test('composeTutorEmail addresses the tutor and includes booking + student details', () => {
  const message = composeTutorEmail({ booking, tutor });

  assert.equal(message.to, tutor.email);
  assert.match(message.subject, /Aisha Ndlovu/);
  assert.match(message.subject, /Calculus I/);
  assert.match(message.text, /Aisha Ndlovu/);
  assert.match(message.text, /aisha@example\.com/);
  assert.match(message.text, /Calculus I/);
  assert.match(message.text, /2026-10-01/);
  assert.match(message.text, /Need help with derivatives/);
  assert.match(message.text, /#42/);
});

test('composeStudentEmail falls back to "(none)" when message is empty', () => {
  const message = composeStudentEmail({ booking: { ...booking, message: '' }, tutor });
  assert.match(message.text, /\(none\)/);
});

test('composeStudentEmail does not repeat the time when preferredDate already includes it', () => {
  const combinedBooking = { ...booking, preferredDate: '2026-10-01 3:00 PM', preferredTime: '3:00 PM' };
  const message = composeStudentEmail({ booking: combinedBooking, tutor });
  assert.match(message.text, /Preferred date\/time: 2026-10-01 3:00 PM$/m);
  assert.doesNotMatch(message.text, /3:00 PM 3:00 PM/);
});
