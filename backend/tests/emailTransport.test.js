process.env.NODE_ENV = 'test';
// Set even though fake: proves NODE_ENV=test wins over SMTP_HOST being configured,
// so a real .env file on a dev machine can never make tests hit a real SMTP server.
process.env.SMTP_HOST = 'smtp.example.com';

const test = require('node:test');
const assert = require('node:assert/strict');
const { EMAIL_TRANSPORT_MODE } = require('../src/config');
const { getTransporter, _resetForTests } = require('../src/email/transport');

test('NODE_ENV=test forces json transport mode even when SMTP_HOST is configured', () => {
  assert.equal(EMAIL_TRANSPORT_MODE, 'json');
});

test('getTransporter resolves to a working jsonTransport under NODE_ENV=test', async () => {
  _resetForTests();

  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from: 'Find My Tutor <no-reply@findmytutor.local>',
    to: 'student@example.com',
    subject: 'Test subject',
    text: 'Test body',
  });

  const envelope = JSON.parse(info.message);
  assert.equal(envelope.to[0].address, 'student@example.com');
  assert.equal(envelope.subject, 'Test subject');
  assert.equal(envelope.text, 'Test body');
});

test('getTransporter caches the same in-flight/resolved promise across calls', async () => {
  _resetForTests();

  const first = getTransporter();
  const second = getTransporter();

  assert.equal(first, second);
  assert.equal(await first, await second);
});
