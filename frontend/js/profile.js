const API_URL = 'http://localhost:5050/api/tutors';

document.addEventListener('DOMContentLoaded', async () => {
  const status = document.getElementById('profile-status');
  const content = document.getElementById('profile-content');
  const tutorId = new URLSearchParams(window.location.search).get('id');

  if (!tutorId || !/^\d+$/.test(tutorId)) {
    status.textContent = 'That tutor profile link is not valid.';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${encodeURIComponent(tutorId)}`);
    if (response.status === 404) throw new Error('Tutor profile not found.');
    if (!response.ok) throw new Error('Tutor profiles are temporarily unavailable.');

    const { tutor } = await response.json();
    document.title = `${tutor.name} | Find My Tutor`;
    document.getElementById('profile-avatar').textContent = tutor.name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();
    document.getElementById('profile-name').textContent = tutor.name;
    document.getElementById('profile-major').textContent = tutor.major;
    document.getElementById('profile-classification').textContent = tutor.classification;
    document.getElementById('profile-subjects').textContent = tutor.subjects.join(', ');
    document.getElementById('profile-availability').textContent = tutor.availability.join(' · ');
    document.getElementById('booking-link').href = `./index.html?tutor=${encodeURIComponent(tutor.id)}#booking`;
    status.hidden = true;
    content.hidden = false;
  } catch (error) {
    status.textContent = error.message;
  }
});