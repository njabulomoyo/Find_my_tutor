const test = require('node:test');
const assert = require('node:assert/strict');
const { filterTutors } = require('../src/tutorService');

const tutors = [
  { id: 1, name: 'Amar Singh', subject: 'Physics' },
  { id: 2, name: 'Lerato Khumalo', subject: 'English' },
  { id: 3, name: 'Johan Pretorius', subject: 'Computer Science' }
];

test('returns all tutors when search term is empty', () => {
  assert.deepEqual(filterTutors(tutors, ''), tutors);
});

test('matches tutor names case-insensitively', () => {
  const result = filterTutors(tutors, 'LERATO');
  assert.deepEqual(result, [tutors[1]]);
});

test('matches tutor subjects case-insensitively', () => {
  const result = filterTutors(tutors, 'physics');
  assert.deepEqual(result, [tutors[0]]);
});

test('returns empty array when no tutors match', () => {
  const result = filterTutors(tutors, 'history');
  assert.deepEqual(result, []);
});
