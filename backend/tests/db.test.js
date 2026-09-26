const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const sqlite3 = require('sqlite3').verbose();
const { initializeDatabase } = require('../src/db');
const tutorRepository = require('../src/db/tutorRepository');
const bookingRepository = require('../src/db/bookingRepository');

test('persists tutor and booking data in SQLite', async () => {
  const dbPath = path.join(__dirname, 'temp-find-my-tutor.db');

  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  await initializeDatabase(dbPath);

  const tutors = await tutorRepository.findAll(dbPath);
  assert.equal(tutors.length >= 1, true);
  assert.equal(tutors.some((tutor) => tutor.name === 'Adriel Dube'), true);

  const tutor = await tutorRepository.findById(dbPath, 1);
  assert.equal(tutor.major, 'Computer Science & Cloud Computing');
  assert.equal(tutor.classification, 'Senior');
  assert.equal(tutor.email, 'adube@gsumail.gram.edu');
  assert.deepEqual(tutor.subjects, [
    'Pre-Calculus',
    'Calculus I',
    'Probability and Statistics',
    'Data Structures and Algorithms',
    'Computer Science I',
    'Computer Science II',
  ]);
  assert.deepEqual(tutor.availability, [
    'Mon 8:00 AM - 9:00 AM',
    'Tue 11:00 AM - 12:00 PM',
    'Wed 8:00 AM - 9:00 AM',
    'Thu 11:00 AM - 12:00 PM',
  ]);

  const booking = await bookingRepository.create(dbPath, {
    studentName: 'Aisha Ndlovu',
    email: 'aisha@example.com',
    tutorId: 1,
    preferredDate: '2026-09-12',
    preferredTime: '10:00',
    subject: 'Physics',
    message: 'Need help',
    tutorName: 'Adriel Dube',
  });

  assert.equal(booking.studentName, 'Aisha Ndlovu');

  const savedBookings = await bookingRepository.findAll(dbPath);
  assert.equal(savedBookings.length >= 1, true);

  fs.unlinkSync(dbPath);
});

test('migrates legacy tutor fields to the current tutor model', async () => {
  const dbPath = path.join(__dirname, 'temp-legacy-find-my-tutor.db');

  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  const legacyDb = new sqlite3.Database(dbPath);
  await new Promise((resolve, reject) => {
    legacyDb.run(`
      CREATE TABLE tutors (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        subject TEXT NOT NULL,
        rating REAL,
        pricePerHour INTEGER,
        experience TEXT
      )
    `, (error) => error ? reject(error) : resolve());
  });
  await new Promise((resolve, reject) => {
    legacyDb.run(
      'INSERT INTO tutors (id, name, subject, rating, pricePerHour, experience) VALUES (?, ?, ?, ?, ?, ?)',
      [1, 'Legacy Tutor', 'History', 4.5, 100, '2 years'],
      (error) => error ? reject(error) : resolve()
    );
  });
  await new Promise((resolve) => legacyDb.close(resolve));

  const tutorDb = await initializeDatabase(dbPath);

  try {
    const tutor = await tutorRepository.findById(dbPath, 1);
    assert.deepEqual(tutor, {
      id: 1,
      name: 'Legacy Tutor',
      image: null,
      major: 'History',
      classification: 'Unspecified',
      subjects: ['History'],
      availability: [],
      email: null,
    });
  } finally {
    tutorDb.close();
    fs.unlinkSync(dbPath);
  }
});
