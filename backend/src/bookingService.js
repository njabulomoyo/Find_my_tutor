function normalizeText(value) {
  return String(value ?? '').trim();
}

function validateBooking(booking = {}) {
  const preferredDateTime = normalizeText(booking.preferredDateTime || '');
  const preferredDate = normalizeText(booking.preferredDate || '');
  const preferredTime = normalizeText(booking.preferredTime || '');
  const combinedDateTime = preferredDateTime || (preferredDate && preferredTime ? `${preferredDate} ${preferredTime}` : preferredDate);

  const requiredFields = ['studentName', 'email', 'tutorId', 'subject'];
  const missingFields = requiredFields.filter((field) => normalizeText(booking[field]) === '');

  if (!combinedDateTime) {
    missingFields.push('preferredDate');
  }

  if (missingFields.length > 0) {
    throw new Error(`Required fields are missing: ${missingFields.join(', ')}`);
  }

  const studentName = normalizeText(booking.studentName);
  const email = normalizeText(booking.email).toLowerCase();
  const subject = normalizeText(booking.subject);
  const tutorId = Number(booking.tutorId);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Please provide a valid email address.');
  }

  if (!Number.isInteger(tutorId) || tutorId <= 0) {
    throw new Error('Tutor selection is invalid.');
  }

  return {
    studentName,
    email,
    tutorId,
    preferredDate: combinedDateTime,
    subject,
    message: normalizeText(booking.message || ''),
  };
}

module.exports = {
  validateBooking,
};
