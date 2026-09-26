const test = require('node:test');
const assert = require('node:assert/strict');
const {
  formatTime,
  formatDateLabel,
  formatAvailability,
  bookingWindow,
  generateSlots,
  openSlotsForSubject,
  rankTutors,
} = require('../src/scheduleService');

// Monday, Sep 28 2026, 7:00 AM local time.
const MONDAY_MORNING = new Date(2026, 8, 28, 7, 0);

test('formats times and dates for display', () => {
  assert.equal(formatTime('00:00'), '12:00 AM');
  assert.equal(formatTime('09:05'), '9:05 AM');
  assert.equal(formatTime('12:00'), '12:00 PM');
  assert.equal(formatTime('15:30'), '3:30 PM');
  assert.equal(formatDateLabel('2026-09-28'), 'Mon, Sep 28');
});

test('formatAvailability groups windows by day in weekday order', () => {
  assert.deepEqual(formatAvailability([
    { day: 'Wed', start: '11:00', end: '17:00' },
    { day: 'Mon', start: '15:30', end: '17:00' },
    { day: 'Mon', start: '10:00', end: '12:00' },
  ]), [
    'Mon 10:00 AM - 12:00 PM & 3:30 PM - 5:00 PM',
    'Wed 11:00 AM - 5:00 PM',
  ]);
});

test('bookingWindow covers today plus the next 13 days', () => {
  assert.deepEqual(bookingWindow(MONDAY_MORNING), { fromDate: '2026-09-28', toDate: '2026-10-11' });
});

test('splits a window into 30-minute slots on matching weekdays only', () => {
  const slots = generateSlots({
    windows: [{ day: 'Mon', start: '10:00', end: '12:00' }],
    now: MONDAY_MORNING,
    days: 7,
  });

  assert.deepEqual(slots, [
    { date: '2026-09-28', start: '10:00', end: '10:30' },
    { date: '2026-09-28', start: '10:30', end: '11:00' },
    { date: '2026-09-28', start: '11:00', end: '11:30' },
    { date: '2026-09-28', start: '11:30', end: '12:00' },
  ]);
});

test('a 30-minute window gives exactly one slot and leftovers are dropped', () => {
  const slots = generateSlots({
    windows: [{ day: 'Mon', start: '16:30', end: '17:00' }, { day: 'Tue', start: '09:00', end: '09:45' }],
    now: MONDAY_MORNING,
    days: 2,
  });

  assert.deepEqual(slots.map((slot) => `${slot.date} ${slot.start}`), ['2026-09-28 16:30', '2026-09-29 09:00']);
});

test('drops slots that have already started', () => {
  const slots = generateSlots({
    windows: [{ day: 'Mon', start: '10:00', end: '12:00' }],
    now: new Date(2026, 8, 28, 10, 45),
    days: 1,
  });

  assert.deepEqual(slots.map((slot) => slot.start), ['11:00', '11:30']);
});

test('drops booked slots', () => {
  const slots = generateSlots({
    windows: [{ day: 'Mon', start: '10:00', end: '11:00' }],
    bookings: [{ sessionDate: '2026-09-28', startTime: '10:00' }],
    now: MONDAY_MORNING,
    days: 1,
  });

  assert.deepEqual(slots.map((slot) => slot.start), ['10:30']);
});

test('only generates slots within the booking range', () => {
  const slots = generateSlots({
    windows: [{ day: 'Mon', start: '10:00', end: '10:30' }],
    now: MONDAY_MORNING,
  });

  assert.deepEqual(slots.map((slot) => slot.date), ['2026-09-28', '2026-10-05']);
});

const tutors = [
  { id: 1, name: 'Ada', subjects: ['Calculus I'], availability: [{ day: 'Mon', start: '10:00', end: '11:00' }] },
  { id: 2, name: 'Ben', subjects: ['calculus i', 'Physics'], availability: [{ day: 'Mon', start: '10:30', end: '11:30' }] },
  { id: 3, name: 'Cy', subjects: ['Physics'], availability: [{ day: 'Mon', start: '10:00', end: '11:00' }] },
];

test('openSlotsForSubject merges times across tutors who teach the subject', () => {
  const slots = openSlotsForSubject({ tutors, subject: 'Calculus I', now: MONDAY_MORNING, days: 1 });

  assert.deepEqual(slots, [
    { date: '2026-09-28', start: '10:00', end: '10:30', tutors: [{ id: 1, name: 'Ada' }] },
    { date: '2026-09-28', start: '10:30', end: '11:00', tutors: [{ id: 1, name: 'Ada' }, { id: 2, name: 'Ben' }] },
    { date: '2026-09-28', start: '11:00', end: '11:30', tutors: [{ id: 2, name: 'Ben' }] },
  ]);
});

test('openSlotsForSubject respects bookings and the tutor filter', () => {
  const slots = openSlotsForSubject({
    tutors,
    bookings: [{ tutorId: 1, sessionDate: '2026-09-28', startTime: '10:30' }],
    subject: 'Calculus I',
    now: MONDAY_MORNING,
    days: 1,
  });
  assert.deepEqual(slots[1].tutors, [{ id: 2, name: 'Ben' }]);

  const onlyAda = openSlotsForSubject({ tutors, subject: 'Calculus I', tutorId: 1, now: MONDAY_MORNING, days: 1 });
  assert.deepEqual(onlyAda.map((slot) => slot.start), ['10:00', '10:30']);
});

test('rankTutors puts the least-booked tutor first, ties by lowest id', () => {
  const free = [{ id: 2, name: 'Ben' }, { id: 1, name: 'Ada' }, { id: 3, name: 'Cy' }];
  const bookings = [{ tutorId: 1 }, { tutorId: 1 }, { tutorId: 2 }];

  assert.deepEqual(rankTutors(free, bookings).map((tutor) => tutor.id), [3, 2, 1]);
  assert.deepEqual(rankTutors(free, []).map((tutor) => tutor.id), [1, 2, 3]);
});
