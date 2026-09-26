function formatWhen(booking) {
  const date = (booking.preferredDate || '').trim();
  const time = (booking.preferredTime || '').trim();

  if (!time || date.endsWith(time)) {
    return date;
  }

  return [date, time].filter(Boolean).join(' ').trim();
}

function composeStudentEmail({ booking, tutor }) {
  const when = formatWhen(booking);
  return {
    to: booking.email,
    subject: `Your tutoring session request with ${tutor.name} has been received`,
    text: [
      `Hi ${booking.studentName},`,
      '',
      'Your booking request has been received. Here are the details:',
      '',
      `Tutor: ${tutor.name}`,
      `Subject: ${booking.subject}`,
      `Preferred date/time: ${when}`,
      `Your message: ${booking.message || '(none)'}`,
      '',
      `Booking reference: #${booking.id} (submitted ${booking.createdAt})`,
      '',
      "We'll be in touch to confirm the session.",
      '',
      '— Find My Tutor',
    ].join('\n'),
  };
}

function composeTutorEmail({ booking, tutor }) {
  const when = formatWhen(booking);
  return {
    to: tutor.email,
    subject: `New tutoring request: ${booking.subject} with ${booking.studentName}`,
    text: [
      `Hi ${tutor.name},`,
      '',
      'You have a new tutoring request:',
      '',
      `Student: ${booking.studentName}`,
      `Student email: ${booking.email}`,
      `Subject: ${booking.subject}`,
      `Preferred date/time: ${when}`,
      `Message: ${booking.message || '(none)'}`,
      '',
      `Booking reference: #${booking.id} (submitted ${booking.createdAt})`,
      '',
      'Please reach out to the student directly to confirm.',
      '',
      '— Find My Tutor',
    ].join('\n'),
  };
}

module.exports = { composeStudentEmail, composeTutorEmail };
