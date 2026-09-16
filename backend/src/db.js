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

function parseTutor(tutor) {
  return {
    ...tutor,
    subjects: JSON.parse(tutor.subjects),
    availability: JSON.parse(tutor.availability),
  };
}

async function getTableColumns(db, tableName) {
  const columns = await all(db, `PRAGMA table_info(${tableName})`);
  return columns.map((column) => column.name);
}

async function migrateTutorsTable(db) {
  const columns = await getTableColumns(db, 'tutors');
  const hasCurrentSchema = ['major', 'classification', 'subjects', 'availability']
    .every((column) => columns.includes(column));

  if (hasCurrentSchema) {
    return;
  }

  await run(db, 'ALTER TABLE tutors RENAME TO tutors_legacy');
  await run(db, `
    CREATE TABLE tutors (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      major TEXT NOT NULL,
      classification TEXT NOT NULL,
      subjects TEXT NOT NULL,
      availability TEXT NOT NULL
    )
  `);
  await run(db, `
    INSERT INTO tutors (id, name, major, classification, subjects, availability)
    SELECT id, name, subject, 'Unspecified', json_array(subject), json_array()
    FROM tutors_legacy
  `);
  await run(db, 'DROP TABLE tutors_legacy');
}

async function initializeDatabase(filePath = DB_PATH) {
  const db = await openDatabase(filePath);

  try {
    await run(db, `
      CREATE TABLE IF NOT EXISTS tutors (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        major TEXT NOT NULL,
        classification TEXT NOT NULL,
        subjects TEXT NOT NULL,
        availability TEXT NOT NULL
      )
    `);

    await migrateTutorsTable(db);

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
          INSERT INTO tutors (id, name, major, classification, subjects, availability)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          tutor.id,
          tutor.name,
          tutor.major,
          tutor.classification,
          JSON.stringify(tutor.subjects),
          JSON.stringify(tutor.availability),
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
    const tutors = await all(db, 'SELECT id, name, major, classification, subjects, availability FROM tutors ORDER BY id ASC');
    return tutors.map(parseTutor);
  } finally {
    db.close();
  }
}

async function getTutorById(filePath = DB_PATH, tutorId) {
  const db = await openDatabase(filePath);

  try {
    const tutor = await get(db, 'SELECT id, name, major, classification, subjects, availability FROM tutors WHERE id = ?', [Number(tutorId)]);
    return tutor ? parseTutor(tutor) : tutor;
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
