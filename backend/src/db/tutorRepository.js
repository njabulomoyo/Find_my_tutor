const { openDatabase } = require('./connection');

function parseTutor(tutor) {
  return {
    ...tutor,
    subjects: JSON.parse(tutor.subjects),
    availability: JSON.parse(tutor.availability),
  };
}

async function findAll(filePath) {
  const db = await openDatabase(filePath);

  try {
    const tutors = await new Promise((resolve, reject) => {
      db.all(
        'SELECT id, name, major, classification, subjects, availability FROM tutors ORDER BY id ASC',
        (error, rows) => error ? reject(error) : resolve(rows)
      );
    });
    return tutors.map(parseTutor);
  } finally {
    db.close();
  }
}

async function findById(filePath, tutorId) {
  const db = await openDatabase(filePath);

  try {
    const tutor = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, name, major, classification, subjects, availability FROM tutors WHERE id = ?',
        [Number(tutorId)],
        (error, row) => error ? reject(error) : resolve(row)
      );
    });
    return tutor ? parseTutor(tutor) : tutor;
  } finally {
    db.close();
  }
}

module.exports = {
  findAll,
  findById,
};
