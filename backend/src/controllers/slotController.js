const {
  bookingWindow,
  formatDateLabel,
  formatTimeRange,
  openSlotsForSubject,
} = require('../scheduleService');
const tutorRepository = require('../db/tutorRepository');
const bookingRepository = require('../db/bookingRepository');

async function listSlots(req, res) {
  const subject = String(req.query.subject || '').trim();
  const rawTutorId = String(req.query.tutorId || '').trim();
  const tutorId = rawTutorId ? Number(rawTutorId) : undefined;

  if (!subject) {
    return res.status(400).json({ message: 'Choose a subject to see available times.' });
  }

  if (tutorId !== undefined && (!Number.isInteger(tutorId) || tutorId <= 0)) {
    return res.status(400).json({ message: 'Tutor selection is invalid.' });
  }

  try {
    const now = new Date();
    const { fromDate, toDate } = bookingWindow(now);
    const [tutors, bookings] = await Promise.all([
      tutorRepository.findAll(),
      bookingRepository.findScheduledBetween(undefined, fromDate, toDate),
    ]);

    const slots = openSlotsForSubject({ tutors, bookings, subject, tutorId, now }).map((slot) => ({
      ...slot,
      dateLabel: formatDateLabel(slot.date),
      timeLabel: formatTimeRange(slot.start, slot.end),
    }));

    return res.json({ slots });
  } catch {
    return res.status(500).json({ message: 'Unable to load available times.' });
  }
}

module.exports = {
  listSlots,
};
