const { validateBooking } = require('../bookingService');
const {
  MAX_SESSIONS_PER_DAY,
  bookingWindow,
  formatTimeRange,
  openSlotsForSubject,
  rankTutors,
  teachesSubject,
} = require('../scheduleService');
const tutorRepository = require('../db/tutorRepository');
const bookingRepository = require('../db/bookingRepository');
const { sendBookingEmails } = require('../email');

const SLOT_TAKEN_MESSAGE = 'That time is no longer available. Please choose another time.';

async function createBookingRequest(req, res) {
  let request;

  try {
    request = validateBooking(req.body);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  try {
    const { studentName, email, tutorId, subject, date, start, message } = request;
    const tutors = await tutorRepository.findAll();

    if (tutorId !== 'any') {
      const tutor = tutors.find((candidate) => candidate.id === tutorId);
      if (!tutor) {
        return res.status(400).json({ message: 'Selected tutor is not available.' });
      }
      if (!teachesSubject(tutor, subject)) {
        return res.status(400).json({ message: `${tutor.name} does not tutor ${subject}.` });
      }
    } else if (!tutors.some((tutor) => teachesSubject(tutor, subject))) {
      return res.status(400).json({ message: `No tutors are available for ${subject}.` });
    }

    const studentBookings = await bookingRepository.findByEmailOnDate(undefined, email, date);
    if (studentBookings.some((booking) => booking.startTime === start)) {
      return res.status(409).json({ message: 'You already have a session at that time.' });
    }
    if (studentBookings.length >= MAX_SESSIONS_PER_DAY) {
      return res.status(409).json({ message: `You can book at most ${MAX_SESSIONS_PER_DAY} sessions per day.` });
    }

    const now = new Date();
    const { fromDate, toDate } = bookingWindow(now);
    const bookings = await bookingRepository.findScheduledBetween(undefined, fromDate, toDate);
    const slot = openSlotsForSubject({
      tutors,
      bookings,
      subject,
      tutorId: tutorId === 'any' ? undefined : tutorId,
      now,
    }).find((openSlot) => openSlot.date === date && openSlot.start === start);

    if (!slot) {
      return res.status(409).json({ message: SLOT_TAKEN_MESSAGE });
    }

    // Try the free tutors in order. If another request grabbed the same tutor and
    // slot a moment ago, the database's unique index rejects the insert and we
    // move on to the next free tutor (only possible for "any available tutor").
    for (const candidate of rankTutors(slot.tutors, bookings)) {
      const tutor = tutors.find((t) => t.id === candidate.id);
      let booking;

      try {
        booking = await bookingRepository.create(undefined, {
          studentName,
          email,
          tutorId: tutor.id,
          tutorName: tutor.name,
          subject,
          message,
          preferredDate: date,
          preferredTime: formatTimeRange(slot.start, slot.end),
          sessionDate: slot.date,
          startTime: slot.start,
          endTime: slot.end,
        });
      } catch (error) {
        if (bookingRepository.isSlotTakenError(error)) {
          continue;
        }
        throw error;
      }

      await sendBookingEmails({ booking, tutor });

      return res.status(201).json({
        message: 'Booking request submitted successfully.',
        booking,
      });
    }

    return res.status(409).json({ message: SLOT_TAKEN_MESSAGE });
  } catch {
    return res.status(500).json({ message: 'Unable to submit booking request.' });
  }
}

module.exports = {
  createBookingRequest,
};
