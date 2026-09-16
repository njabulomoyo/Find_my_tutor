const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  initializeDatabase,
  getTutors,
  getTutorById,
  createBooking,
  getBookings,
} = require('../src/db');

test('persists tutor and booking data in SQLite', async () => {
  const dbPath = path.join(__dirname, 'temp-find-my-tutor.db');

  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  const db = await initializeDatabase(dbPath);

  try {
    await db.run('DELETE FROM tutors WHERE id = 1');
  } catch {
    // ignore if table is empty
  }

  await db.run(
    'INSERT INTO tutors (id, name, subject, rating, pricePerHour, experience) VALUES (?, ?, ?, ?, ?, ?)',
    [1, 'Amar Singh', 'Physics', 4.9, 220, '6 years']
  );

  const tutors = await getTutors(dbPath);
  assert.equal(tutors.length >= 1, true);
  assert.equal(tutors.some((tutor) => tutor.name === 'Amar Singh'), true);

  const tutor = await getTutorById(dbPath, 1);
  assert.equal(tutor.subject, 'Physics');

  const booking = await createBooking(dbPath, {
    studentName: 'Aisha Ndlovu',
    email: 'aisha@example.com',
    tutorId: 1,
    preferredDate: '2026-09-12',
    preferredTime: '10:00',
    subject: 'Physics',
    message: 'Need help',
    tutorName: 'Amar Singh',
  });

  assert.equal(booking.studentName, 'Aisha Ndlovu');

  const savedBookings = await getBookings(dbPath);
  assert.equal(savedBookings.length >= 1, true);

  fs.unlinkSync(dbPath);
});
