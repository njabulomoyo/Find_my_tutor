// Imports src/data/tutors.js into the database: updates existing tutors and adds
// missing ones. Never deletes tutors or bookings. Usage: npm run seed:tutors
const { initializeDatabase, syncTutorsFromSeed } = require('../src/db');
const { DB_PATH } = require('../src/config');

(async () => {
  const db = await initializeDatabase();

  try {
    const count = await syncTutorsFromSeed(db);
    console.log(`Imported ${count} tutors from src/data/tutors.js into ${DB_PATH}`);
  } finally {
    db.close();
  }
})().catch((error) => {
  console.error('Unable to import tutors.', error);
  process.exitCode = 1;
});
