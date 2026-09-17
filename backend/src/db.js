const tutorsSeed = require('./data/tutors');
const { DB_PATH, openDatabase, run, get, all } = require('./db/connection');
const tutorRepository = require('./db/tutorRepository');
const bookingRepository = require('./db/bookingRepository');

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

function getTutors(filePath = DB_PATH) {
  return tutorRepository.findAll(filePath);
}

function getTutorById(filePath = DB_PATH, tutorId) {
  return tutorRepository.findById(filePath, tutorId);
}

function getBookings(filePath = DB_PATH) {
  return bookingRepository.findAll(filePath);
}

function createBooking(filePath = DB_PATH, booking) {
  return bookingRepository.create(filePath, booking);
}

module.exports = {
  DB_PATH,
  initializeDatabase,
  getTutors,
  getTutorById,
  getBookings,
  createBooking,
};
