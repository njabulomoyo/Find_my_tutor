const path = require('node:path');

const PORT = process.env.PORT || 5050;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'find-my-tutor.db');

module.exports = { PORT, DB_PATH };
