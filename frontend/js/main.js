import { fetchTutors } from './api.js';
import { renderTutorGrid } from './tutorGrid.js';
import { populateBookingFields, initBookingForm } from './bookingForm.js';
import { initSidebarNav } from './sidebarNav.js';

document.addEventListener('DOMContentLoaded', () => {
  const tutorGrid = document.getElementById('tutor-grid');
  const tutorStatus = document.getElementById('tutor-status');
  const subjectSelect = document.getElementById('subject');
  const tutorSelect = document.getElementById('booking-tutor');
  const studentNameInput = document.getElementById('student-name');
  const emailInput = document.getElementById('student-email');
  const dateInput = document.getElementById('date');
  const timeInput = document.getElementById('time');
  const messageInput = document.getElementById('message');
  const bookingForm = document.getElementById('booking-form');
  const bookingStatus = document.getElementById('booking-status');

  let tutors = [];

  async function loadTutors() {
    try {
      tutors = await fetchTutors();
    } catch (error) {
      tutors = [];
      tutorStatus.textContent = 'Tutor profiles are temporarily unavailable. Please try again later.';
    }
    renderTutorGrid(tutors, { gridEl: tutorGrid, statusEl: tutorStatus });
    populateBookingFields(tutors, { subjectSelect, tutorSelect });
  }

  initSidebarNav();

  initBookingForm({
    formEl: bookingForm,
    subjectSelect,
    tutorSelect,
    dateInput,
    timeInput,
    messageInput,
    studentNameInput,
    emailInput,
    statusEl: bookingStatus,
  }, () => tutors);

  loadTutors();
});
