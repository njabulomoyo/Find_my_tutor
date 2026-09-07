const express = require('express');
const tutors = require('./data/tutors');
const { filterTutors } = require('./tutorService');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
