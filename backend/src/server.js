const express = require('express');
const path = require('path');
const { filterTutors } = require('./tutorService');
const { validateBooking } = require('./bookingService');
const { initializeDatabase, getTutors, getTutorById, createBooking } = require('./db');

const app = express();
const PORT = process.env.PORT || 5050;
let db = null;

(async () => {
  db = await initializeDatabase();
})();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../../frontend')));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
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

app.get('/api/tutors', async (req, res) => {
  try {
    const query = String(req.query.q || '').trim();
    const allTutors = await getTutors();
    const filteredTutors = filterTutors(allTutors, query);
    return res.json({ tutors: filteredTutors });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch tutors.' });
  }
});

app.get('/api/tutors/:id', async (req, res) => {
  try {
    const tutor = await getTutorById(undefined, req.params.id);

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    return res.json({ tutor });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch tutor profile.' });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const validBooking = validateBooking(req.body);
    const tutor = await getTutorById(undefined, validBooking.tutorId);

    if (!tutor) {
      return res.status(400).json({ message: 'Selected tutor is not available.' });
    }

    const createdBooking = await createBooking(undefined, {
      ...validBooking,
      tutorName: tutor.name,
      preferredTime: req.body.preferredTime || '',
    });

    return res.status(201).json({
      message: 'Booking request submitted successfully.',
      booking: createdBooking,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
