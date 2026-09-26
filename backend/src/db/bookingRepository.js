const { openDatabase, run, get, all } = require('./connection');

async function findAll(filePath) {
  const db = await openDatabase(filePath);

  try {
    return await all(db, 'SELECT * FROM bookings ORDER BY id ASC');
  } finally {
    db.close();
  }
}

async function findScheduledBetween(filePath, fromDate, toDate) {
  const db = await openDatabase(filePath);

  try {
    return await all(db, `
      SELECT * FROM bookings
      WHERE sessionDate BETWEEN ? AND ?
      ORDER BY sessionDate ASC, startTime ASC
    `, [fromDate, toDate]);
  } finally {
    db.close();
  }
}

async function findByEmailOnDate(filePath, email, sessionDate) {
  const db = await openDatabase(filePath);

  try {
    return await all(db, 'SELECT * FROM bookings WHERE email = ? AND sessionDate = ?', [email, sessionDate]);
  } finally {
    db.close();
  }
}

async function create(filePath, booking) {
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
        createdAt,
        sessionDate,
        startTime,
        endTime
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      booking.sessionDate || null,
      booking.startTime || null,
      booking.endTime || null,
    ]);

    return await get(db, 'SELECT * FROM bookings WHERE id = ?', [result.id]);
  } finally {
    db.close();
  }
}

function isSlotTakenError(error) {
  return Boolean(error)
    && error.code === 'SQLITE_CONSTRAINT'
    && error.message.includes('UNIQUE constraint failed: bookings.tutorId, bookings.sessionDate, bookings.startTime');
}

module.exports = {
  findAll,
  findScheduledBetween,
  findByEmailOnDate,
  create,
  isSlotTakenError,
};
