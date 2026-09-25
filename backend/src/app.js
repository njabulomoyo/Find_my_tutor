const express = require('express');
const path = require('node:path');
const tutorRoutes = require('./routes/tutorRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const { CORS_ORIGIN } = require('./config');

function createApp() {
  const app = express();

  app.use(express.json());
  app.use(express.static(path.join(__dirname, '../../frontend')));
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    return next();
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Find My Tutor backend is running.' });
  });
  app.use('/api/tutors', tutorRoutes);
  app.use('/api/bookings', bookingRoutes);

  return app;
}

module.exports = {
  createApp,
};
