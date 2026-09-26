const nodemailer = require('nodemailer');
const { getTransporter } = require('./transport');
const { composeStudentEmail, composeTutorEmail } = require('./content');
const { EMAIL_FROM } = require('../config');

async function sendOne(message) {
  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({ from: EMAIL_FROM, ...message });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[email] preview: ${previewUrl}`);
    }
    return { ok: true, info };
  } catch (error) {
    console.error(`[email] failed to send "${message.subject}" to ${message.to}:`, error.message);
    return { ok: false, error };
  }
}

async function sendBookingEmails({ booking, tutor }) {
  const [student, tutorResult] = await Promise.all([
    sendOne(composeStudentEmail({ booking, tutor })),
    tutor.email
      ? sendOne(composeTutorEmail({ booking, tutor }))
      : Promise.resolve({ ok: false, error: new Error('tutor has no email on file') }),
  ]);

  return { student, tutor: tutorResult };
}

module.exports = { sendBookingEmails };
