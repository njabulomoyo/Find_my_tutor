import { fetchSlots, submitBooking } from './api.js';

const ANY_TUTOR = 'any';

function resetSelect(select, placeholder, value = '') {
  select.innerHTML = '';
  select.add(new Option(placeholder, value));
}

function teaches(tutor, subject) {
  return tutor.subjects.some((tutorSubject) => tutorSubject.toLowerCase() === subject.toLowerCase());
}

function slotValue(slot) {
  return `${slot.date}T${slot.start}`;
}

export function initBookingForm(fields, getTutors) {
  const {
    formEl,
    subjectSelect,
    tutorSelect,
    slotSelect,
    slotTutorField,
    slotTutorSelect,
    messageInput,
    studentNameInput,
    emailInput,
    statusEl,
  } = fields;

  let slots = [];
  let latestSlotRequest = 0;

  function showStatus(text, kind) {
    statusEl.textContent = text;
    statusEl.classList.toggle('success', kind === 'success');
    statusEl.classList.toggle('error', kind === 'error');
  }

  // Set when arriving from a tutor's profile ("Request a session").
  function preselectedTutor() {
    const tutorId = new URLSearchParams(window.location.search).get('tutor');
    return getTutors().find((tutor) => String(tutor.id) === tutorId);
  }

  function populateSubjects() {
    const tutor = preselectedTutor();
    const sourceTutors = tutor ? [tutor] : getTutors();
    const subjects = [...new Set(sourceTutors.flatMap((t) => t.subjects))].sort();

    resetSelect(subjectSelect, 'Choose a subject');
    subjects.forEach((subject) => subjectSelect.add(new Option(subject, subject)));
  }

  function populateTutorFilter() {
    const subject = subjectSelect.value;
    resetSelect(tutorSelect, 'Any tutor', ANY_TUTOR);

    if (!subject) {
      tutorSelect.disabled = true;
      return;
    }

    getTutors()
      .filter((tutor) => teaches(tutor, subject))
      .forEach((tutor) => tutorSelect.add(new Option(tutor.name, tutor.id)));
    tutorSelect.disabled = false;

    const tutor = preselectedTutor();
    if (tutor && teaches(tutor, subject)) {
      tutorSelect.value = String(tutor.id);
    }
  }

  function renderSlots() {
    const anyTutor = tutorSelect.value === ANY_TUTOR;

    if (slots.length === 0) {
      resetSelect(slotSelect, 'No open times in the next 2 weeks');
      slotSelect.disabled = true;
      return;
    }

    resetSelect(slotSelect, 'Choose a time');
    const groups = new Map();
    slots.forEach((slot) => {
      if (!groups.has(slot.dateLabel)) {
        const group = document.createElement('optgroup');
        group.label = slot.dateLabel;
        groups.set(slot.dateLabel, group);
        slotSelect.append(group);
      }

      const tutorNote = slot.tutors.length === 1 ? slot.tutors[0].name : `${slot.tutors.length} tutors free`;
      const label = anyTutor ? `${slot.timeLabel} · ${tutorNote}` : slot.timeLabel;
      groups.get(slot.dateLabel).append(new Option(label, slotValue(slot)));
    });
    slotSelect.disabled = false;
  }

  function selectedSlot() {
    return slots.find((slot) => slotValue(slot) === slotSelect.value);
  }

  // "Tutor for this time" only matters when several tutors are free at the chosen time.
  function updateSlotTutors() {
    const slot = selectedSlot();

    if (!slot || tutorSelect.value !== ANY_TUTOR || slot.tutors.length < 2) {
      slotTutorField.hidden = true;
      return;
    }

    resetSelect(slotTutorSelect, 'Any available tutor', ANY_TUTOR);
    slot.tutors.forEach((tutor) => slotTutorSelect.add(new Option(tutor.name, tutor.id)));
    slotTutorField.hidden = false;
  }

  async function loadSlots() {
    const subject = subjectSelect.value;
    const requestId = ++latestSlotRequest;
    slots = [];
    slotTutorField.hidden = true;
    slotSelect.disabled = true;

    if (!subject) {
      resetSelect(slotSelect, 'Choose a subject first');
      return;
    }

    resetSelect(slotSelect, 'Loading available times…');

    try {
      const tutorId = tutorSelect.value === ANY_TUTOR ? undefined : tutorSelect.value;
      const result = await fetchSlots(subject, tutorId);
      if (requestId !== latestSlotRequest) return;
      slots = result;
      renderSlots();
    } catch (error) {
      if (requestId !== latestSlotRequest) return;
      resetSelect(slotSelect, 'Times are unavailable right now');
      showStatus(error.message, 'error');
    }
  }

  function resetForm() {
    formEl.reset();
    populateSubjects();
    populateTutorFilter();
    loadSlots();
  }

  subjectSelect.addEventListener('change', () => {
    populateTutorFilter();
    loadSlots();
  });
  tutorSelect.addEventListener('change', loadSlots);
  slotSelect.addEventListener('change', updateSlotTutors);

  formEl.addEventListener('submit', async (event) => {
    event.preventDefault();

    const slot = selectedSlot();
    const subject = subjectSelect.value;
    const studentName = studentNameInput.value.trim();
    const email = emailInput.value.trim();

    if (!slot || !subject || !studentName || !email) {
      showStatus('Please complete all required booking fields before submitting.', 'error');
      return;
    }

    let tutorId = tutorSelect.value;
    if (tutorId === ANY_TUTOR && !slotTutorField.hidden) {
      tutorId = slotTutorSelect.value;
    }

    try {
      const { booking } = await submitBooking({
        studentName,
        email,
        subject,
        tutorId,
        date: slot.date,
        start: slot.start,
        message: messageInput.value,
      });

      showStatus(
        `Request noted with ${booking.tutorName} for ${slot.dateLabel}, ${slot.timeLabel}. The Student Success Center will confirm your appointment.`,
        'success'
      );
      resetForm();
    } catch (error) {
      showStatus(error.message, 'error');
      if (error.status === 409) {
        loadSlots();
      }
    }
  });

  return {
    // Call once the tutor list has loaded.
    refresh: resetForm,
  };
}
