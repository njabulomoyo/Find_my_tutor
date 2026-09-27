const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const SLOT_MINUTES = 30;
const BOOKING_WINDOW_DAYS = 14;
const MAX_SESSIONS_PER_DAY = 4;

function pad(value) {
  return String(value).padStart(2, '0');
}

function toMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function fromMinutes(totalMinutes) {
  return `${pad(Math.floor(totalMinutes / 60))}:${pad(totalMinutes % 60)}`;
}

// '15:30' -> '3:30 PM'
function formatTime(time) {
  const totalMinutes = toMinutes(time);
  const hours = Math.floor(totalMinutes / 60);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${pad(totalMinutes % 60)} ${period}`;
}

// Dates are handled in the server's local time zone as 'YYYY-MM-DD' strings.
function toDateString(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDateString(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// '2026-09-28' -> 'Mon, Sep 28'
function formatDateLabel(dateString) {
  const date = parseDateString(dateString);
  return `${DAY_NAMES[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
}

function formatTimeRange(start, end) {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

// [{ day: 'Mon', start: '10:00', end: '12:00' }, ...] -> ['Mon 10:00 AM - 12:00 PM', ...]
function formatAvailability(windows = []) {
  return DAY_ORDER
    .map((day) => {
      const ranges = windows
        .filter((window) => window.day === day)
        .sort((a, b) => toMinutes(a.start) - toMinutes(b.start))
        .map((window) => formatTimeRange(window.start, window.end));
      return ranges.length > 0 ? `${day} ${ranges.join(' & ')}` : null;
    })
    .filter(Boolean);
}

function bookingWindow(now, days = BOOKING_WINDOW_DAYS) {
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days - 1);
  return { fromDate: toDateString(from), toDate: toDateString(to) };
}

// Splits a tutor's weekly windows into slots over the next `days` days, dropping
// slots that have already started and slots that are already booked.
function generateSlots({ windows = [], bookings = [], now, days = BOOKING_WINDOW_DAYS, slotMinutes = SLOT_MINUTES }) {
  const booked = new Set(bookings.map((booking) => `${booking.sessionDate} ${booking.startTime}`));
  const slots = [];

  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    const dateString = toDateString(date);
    const dayWindows = windows
      .filter((window) => window.day === DAY_NAMES[date.getDay()])
      .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

    for (const window of dayWindows) {
      const windowEnd = toMinutes(window.end);

      for (let minute = toMinutes(window.start); minute + slotMinutes <= windowEnd; minute += slotMinutes) {
        const start = fromMinutes(minute);
        const startsAt = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, minute);

        if (startsAt > now && !booked.has(`${dateString} ${start}`)) {
          slots.push({ date: dateString, start, end: fromMinutes(minute + slotMinutes) });
        }
      }
    }
  }

  return slots;
}

function teachesSubject(tutor, subject) {
  const normalized = String(subject || '').trim().toLowerCase();
  return (tutor.subjects || []).some((tutorSubject) => tutorSubject.toLowerCase() === normalized);
}

// Open times across every tutor who teaches `subject` (or just `tutorId`), merged so
// each time lists all tutors free then.
function openSlotsForSubject({ tutors, bookings = [], subject, tutorId, now, days = BOOKING_WINDOW_DAYS }) {
  const slotsByTime = new Map();

  tutors
    .filter((tutor) => teachesSubject(tutor, subject))
    .filter((tutor) => tutorId === undefined || tutor.id === tutorId)
    .forEach((tutor) => {
      const tutorBookings = bookings.filter((booking) => booking.tutorId === tutor.id);
      generateSlots({ windows: tutor.availability, bookings: tutorBookings, now, days }).forEach((slot) => {
        const key = `${slot.date} ${slot.start}`;
        if (!slotsByTime.has(key)) {
          slotsByTime.set(key, { ...slot, tutors: [] });
        }
        slotsByTime.get(key).tutors.push({ id: tutor.id, name: tutor.name });
      });
    });

  return [...slotsByTime.values()]
    .sort((a, b) => (a.date === b.date ? toMinutes(a.start) - toMinutes(b.start) : a.date.localeCompare(b.date)))
    .map((slot) => ({ ...slot, tutors: slot.tutors.sort((a, b) => a.id - b.id) }));
}

// Orders candidate tutors for "Any available tutor": fewest upcoming bookings first,
// ties broken by lowest id.
function rankTutors(freeTutors, bookings = []) {
  const counts = new Map();
  bookings.forEach((booking) => counts.set(booking.tutorId, (counts.get(booking.tutorId) || 0) + 1));
  return [...freeTutors].sort((a, b) => (counts.get(a.id) || 0) - (counts.get(b.id) || 0) || a.id - b.id);
}

module.exports = {
  SLOT_MINUTES,
  BOOKING_WINDOW_DAYS,
  MAX_SESSIONS_PER_DAY,
  toMinutes,
  formatTime,
  formatTimeRange,
  formatDateLabel,
  formatAvailability,
  bookingWindow,
  generateSlots,
  teachesSubject,
  openSlotsForSubject,
  rankTutors,
};
