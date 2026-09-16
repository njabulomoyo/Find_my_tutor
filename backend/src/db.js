const fs = require('node:fs');
const path = require('node:path');
const sqlite3 = require('sqlite3').verbose();
const tutorsSeed = require('./data/tutors');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'find-my-tutor.db');

function openDatabase(filePath = DB_PATH) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(filePath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(db);
    });
  });
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(error) {
      if (error) {
        reject(error);
        return;
      }

      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(row);
    });
  });
}

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(rows);
    });
  });
}

async function initializeDatabase(filePath = DB_PATH) {
  const db = await openDatabase(filePath);

  try {
    await run(db, `
      CREATE TABLE IF NOT EXISTS tutors (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        subject TEXT NOT NULL,
        rating REAL,
        pricePerHour INTEGER,
        experience TEXT
      )
    `);

    await run(db, `
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentName TEXT NOT NULL,
        email TEXT NOT NULL,
        tutorId INTEGER NOT NULL,
        preferredDate TEXT NOT NULL,
        preferredTime TEXT,
        subject TEXT NOT NULL,
        message TEXT,
        tutorName TEXT,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const row = await get(db, 'SELECT COUNT(*) AS count FROM tutors');

    if (Number(row.count) === 0) {
      for (const tutor of tutorsSeed) {
        await run(db, `
          INSERT INTO tutors (id, name, subject, rating, pricePerHour, experience)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          tutor.id,
          tutor.name,
          tutor.subject,
          tutor.rating,
          tutor.pricePerHour,
          tutor.experience,
        ]);
      }
    }

    return db;
  } catch (error) {
    db.close();
    throw error;
  }
}

async function getTutors(filePath = DB_PATH) {
  const db = await openDatabase(filePath);

  try {
    return await all(db, 'SELECT * FROM tutors ORDER BY id ASC');
  } finally {
    db.close();
  }
}

async function getTutorById(filePath = DB_PATH, tutorId) {
  const db = await openDatabase(filePath);

  try {
    return await get(db, 'SELECT * FROM tutors WHERE id = ?', [Number(tutorId)]);
  } finally {
    db.close();
  }
}

async function getBookings(filePath = DB_PATH) {
  const db = await openDatabase(filePath);

  try {
    return await all(db, 'SELECT * FROM bookings ORDER BY id ASC');
  } finally {
    db.close();
  }
}

async function createBooking(filePath = DB_PATH, booking) {
  const db = await openDatabase(filePath);

  try {
    const result = await run(db, `
      INSERT INTO bookings (
        studentName,
        email,
        tutorId,
        preferredDate,
        preferredTime,
        subject,
        message,
        tutorName,
        createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      booking.studentName,
      booking.email,
      Number(booking.tutorId),
      booking.preferredDate,
      booking.preferredTime || '',
      booking.subject,
      booking.message || '',
      booking.tutorName || '',
      new Date().toISOString(),
    ]);

    return await get(db, 'SELECT * FROM bookings WHERE id = ?', [result.id]);
  } finally {
    db.close();
  }
}

module.exports = {
  DB_PATH,
  initializeDatabase,
  getTutors,
  getTutorById,
  getBookings,
  createBooking,
};
