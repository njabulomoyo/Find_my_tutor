const path = require('node:path');

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

module.exports = { PORT, DB_PATH, CORS_ORIGIN };
