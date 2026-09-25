import { API_BASE_URL } from './config.js';

export async function fetchTutors() {
  const response = await fetch(`${API_BASE_URL}/api/tutors`);
  if (!response.ok) throw new Error('Tutor API unavailable');
  const data = await response.json();
  return data.tutors || [];
}

export async function fetchTutorById(id) {
  const response = await fetch(`${API_BASE_URL}/api/tutors/${encodeURIComponent(id)}`);
  if (response.status === 404) throw new Error('Tutor profile not found.');
  if (!response.ok) throw new Error('Tutor profiles are temporarily unavailable.');
  const { tutor } = await response.json();
  return tutor;
}

export async function submitBooking(payload) {
  const response = await fetch(`${API_BASE_URL}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Booking request could not be submitted.');
  }

  return data;
}
