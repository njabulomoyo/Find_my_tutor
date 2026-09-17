const { openDatabase, run, get, all } = require('./connection');

async function findAll(filePath) {
  const db = await openDatabase(filePath);

  try {
    return await all(db, 'SELECT * FROM bookings ORDER BY id ASC');
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
  findAll,
  create,
};
