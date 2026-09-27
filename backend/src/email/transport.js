const nodemailer = require('nodemailer');
const { EMAIL_TRANSPORT_MODE, SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = require('../config');

let transporterPromise = null;

async function createTransporter() {
  if (EMAIL_TRANSPORT_MODE === 'json') {
    return nodemailer.createTransport({ jsonTransport: true });
  }

  if (EMAIL_TRANSPORT_MODE === 'smtp') {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    });
  }

  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
}

function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = createTransporter().catch((error) => {
      transporterPromise = null;
      throw error;
    });
  }
  return transporterPromise;
}

function _resetForTests() {
  transporterPromise = null;
}

module.exports = { getTransporter, _resetForTests };
