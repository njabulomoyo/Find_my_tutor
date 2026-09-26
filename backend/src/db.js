const tutorsSeed = require('./data/tutors');
const { DB_PATH, openDatabase, run, all } = require('./db/connection');

async function getTableColumns(db, tableName) {
  const columns = await all(db, `PRAGMA table_info(${tableName})`);
  return columns.map((column) => column.name);
}

async function migrateTutorsTable(db) {
  const columns = await getTableColumns(db, 'tutors');
  const hasCurrentSchema = ['major', 'classification', 'subjects', 'availability']
    .every((column) => columns.includes(column));

  if (hasCurrentSchema) {
    if (!columns.includes('image')) {
      await run(db, 'ALTER TABLE tutors ADD COLUMN image TEXT');
    }
    if (!columns.includes('email')) {
      await run(db, 'ALTER TABLE tutors ADD COLUMN email TEXT');
    }
    return;
  }

  await run(db, 'ALTER TABLE tutors RENAME TO tutors_legacy');
  await run(db, `
    CREATE TABLE tutors (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      image TEXT,
      major TEXT NOT NULL,
      classification TEXT NOT NULL,
      subjects TEXT NOT NULL,
      availability TEXT NOT NULL,
      email TEXT
    )
  `);
  await run(db, `
    INSERT INTO tutors (id, name, image, major, classification, subjects, availability, email)
    SELECT id, name, NULL, subject, 'Unspecified', json_array(subject), json_array(), NULL
    FROM tutors_legacy
  `);
  await run(db, 'DROP TABLE tutors_legacy');
}

async function migrateBookingsTable(db) {
  const columns = await getTableColumns(db, 'bookings');

  for (const column of ['sessionDate', 'startTime', 'endTime']) {
    if (!columns.includes(column)) {
      await run(db, `ALTER TABLE bookings ADD COLUMN ${column} TEXT`);
    }
  }

  // A tutor can hold only one booking per slot. This is what makes double booking
  // impossible even if two requests pass the availability check at the same time.
  // Legacy bookings made before time slots existed have no sessionDate.
  await run(db, `
    CREATE UNIQUE INDEX IF NOT EXISTS bookings_tutor_slot
    ON bookings (tutorId, sessionDate, startTime)
    WHERE sessionDate IS NOT NULL
  `);
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
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        sessionDate TEXT,
        startTime TEXT,
        endTime TEXT
      )
    `);

    await migrateBookingsTable(db);

    // data/tutors.js is the source of truth for tutor profiles: sync it on every
    // startup so edits show up after a restart. Tutors not in the seed are left
    // alone (bookings reference them by id).
    for (const tutor of tutorsSeed) {
      await run(db, `
        INSERT INTO tutors (id, name, image, major, classification, subjects, availability, email)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          image = excluded.image,
          major = excluded.major,
          classification = excluded.classification,
          subjects = excluded.subjects,
          availability = excluded.availability,
          email = excluded.email
      `, [
        tutor.id,
        tutor.name,
        tutor.image || null,
        tutor.major,
        tutor.classification,
        JSON.stringify(tutor.subjects),
        JSON.stringify(tutor.availability),
        tutor.email || null,
      ]);
    }

    return db;
  } catch (error) {
    db.close();
    throw error;
  }
}

module.exports = {
  DB_PATH,
  initializeDatabase,
};
