function normalizeText(value) {
  return String(value ?? '').trim();
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function isValidTime(value) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function validateBooking(booking = {}) {
  const requiredFields = ['studentName', 'email', 'tutorId', 'subject', 'date', 'start'];
  const missingFields = requiredFields.filter((field) => normalizeText(booking[field]) === '');

  if (missingFields.length > 0) {
    throw new Error(`Required fields are missing: ${missingFields.join(', ')}`);
  }

  const studentName = normalizeText(booking.studentName);
  const email = normalizeText(booking.email).toLowerCase();
  const subject = normalizeText(booking.subject);
  const date = normalizeText(booking.date);
  const start = normalizeText(booking.start);
  const rawTutorId = normalizeText(booking.tutorId).toLowerCase();
  const tutorId = rawTutorId === 'any' ? 'any' : Number(rawTutorId);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Please provide a valid email address.');
  }

  if (tutorId !== 'any' && (!Number.isInteger(tutorId) || tutorId <= 0)) {
    throw new Error('Tutor selection is invalid.');
  }

  if (!isValidDate(date)) {
    throw new Error('Session date must be a valid YYYY-MM-DD date.');
  }

  if (!isValidTime(start)) {
    throw new Error('Session time must be in HH:MM format.');
  }

  return {
    studentName,
    email,
    tutorId,
    subject,
    date,
    start,
    message: normalizeText(booking.message || ''),
  };
}

module.exports = {
  validateBooking,
};
