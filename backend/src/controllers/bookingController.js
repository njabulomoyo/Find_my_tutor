const { validateBooking } = require('../bookingService');
const tutorRepository = require('../db/tutorRepository');
const bookingRepository = require('../db/bookingRepository');

async function createBookingRequest(req, res) {
  try {
    const validBooking = validateBooking(req.body);
    const tutor = await tutorRepository.findById(undefined, validBooking.tutorId);

    if (!tutor) {
      return res.status(400).json({ message: 'Selected tutor is not available.' });
    }

    const booking = await bookingRepository.create(undefined, {
      ...validBooking,
      tutorName: tutor.name,
      preferredTime: req.body.preferredTime || '',
    });

    return res.status(201).json({
      message: 'Booking request submitted successfully.',
      booking,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

module.exports = {
  createBookingRequest,
};
