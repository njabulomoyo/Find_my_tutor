import { submitBooking } from './api.js';

export function populateBookingFields(tutors, { subjectSelect, tutorSelect }) {
  const subjects = [...new Set(tutors.flatMap((tutor) => tutor.subjects))].sort();
  const selectedTutorId = new URLSearchParams(window.location.search).get('tutor');

  subjectSelect.innerHTML = '<option value="">Choose a subject</option>';
  subjects.forEach((subject) => subjectSelect.add(new Option(subject, subject)));
  tutorSelect.innerHTML = '<option value="">Choose a tutor</option>';
  tutors.forEach((tutor) => tutorSelect.add(new Option(tutor.name, tutor.id)));

  if (selectedTutorId) {
    tutorSelect.value = String(selectedTutorId);
  }
}

export function initBookingForm(fields, getTutors) {
  const {
    formEl,
    subjectSelect,
    tutorSelect,
    dateInput,
    timeInput,
    messageInput,
    studentNameInput,
    emailInput,
    statusEl,
  } = fields;

  formEl.addEventListener('submit', async (event) => {
    event.preventDefault();

    const tutors = getTutors();
    const selectedTutor = tutors.find((tutor) => String(tutor.id) === tutorSelect.value);
    const subject = subjectSelect.value;
    const date = dateInput.value;
    const time = timeInput.value;
    const message = messageInput.value;
    const studentName = studentNameInput.value.trim();
    const email = emailInput.value.trim();

    if (!selectedTutor || !subject || !date || !time || !studentName || !email) {
      statusEl.textContent = 'Please complete all required booking fields before submitting.';
      statusEl.classList.remove('success');
      statusEl.classList.add('error');
      return;
    }

    try {
      await submitBooking({
        studentName,
        email,
        tutorId: selectedTutor.id,
        preferredDate: date,
        preferredTime: time,
        subject,
        message,
      });

      statusEl.textContent = `Request noted for ${selectedTutor.name}. The Student Success Center will confirm your appointment.`;
      statusEl.classList.remove('error');
      statusEl.classList.add('success');
      formEl.reset();
      populateBookingFields(tutors, { subjectSelect, tutorSelect });
    } catch (error) {
      statusEl.textContent = error.message;
      statusEl.classList.remove('success');
      statusEl.classList.add('error');
    }
  });
}
