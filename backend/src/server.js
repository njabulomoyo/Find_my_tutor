const express = require('express');
const path = require('path');
const tutors = require('./data/tutors');
const { filterTutors } = require('./tutorService');
const { validateBooking } = require('./bookingService');

const app = express();
const PORT = process.env.PORT || 5050;
const bookings = [];

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

app.get('/api/tutors', (req, res) => {
  const query = String(req.query.q || '').trim();
  const filteredTutors = filterTutors(tutors, query);
  res.json({ tutors: filteredTutors });
});

app.get('/api/tutors/:id', (req, res) => {
  const tutor = tutors.find((item) => item.id === Number(req.params.id));

  if (!tutor) {
    return res.status(404).json({ message: 'Tutor not found' });
  }

  return res.json({ tutor });
});

app.post('/api/bookings', (req, res) => {
  try {
    const validBooking = validateBooking(req.body);
    const tutor = tutors.find((item) => item.id === validBooking.tutorId);

    if (!tutor) {
      return res.status(400).json({ message: 'Selected tutor is not available.' });
    }

    const createdBooking = {
      id: bookings.length + 1,
      ...validBooking,
      tutorName: tutor.name,
      createdAt: new Date().toISOString(),
    };

    bookings.push(createdBooking);

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
