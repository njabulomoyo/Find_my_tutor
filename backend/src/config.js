const path = require('node:path');

require('dotenv').config();

function parsePort(value, fallback) {
  if (value === undefined || value === '') {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error(`Invalid PORT env var: "${value}". Must be an integer between 1 and 65535.`);
  }

  return parsed;
}

const PORT = parsePort(process.env.PORT, 5050);
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'find-my-tutor.db');
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const NODE_ENV = process.env.NODE_ENV || 'development';

const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = parsePort(process.env.SMTP_PORT, 587);
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'Find My Tutor <no-reply@findmytutor.local>';

const EMAIL_TRANSPORT_MODE = NODE_ENV === 'test'
  ? 'json'
  : (SMTP_HOST ? 'smtp' : 'ethereal');

module.exports = {
  PORT,
  DB_PATH,
  CORS_ORIGIN,
  NODE_ENV,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM,
  EMAIL_TRANSPORT_MODE,
};
