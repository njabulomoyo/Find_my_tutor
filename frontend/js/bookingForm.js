import { fetchSlots, submitBooking } from './api.js';

// The server assigns the tutor: whoever is free at the chosen time with the
// fewest bookings, ties going to the first-listed tutor.
const ANY_TUTOR = 'any';

function resetSelect(select, placeholder) {
  select.innerHTML = '';
  select.add(new Option(placeholder, ''));
}

function slotValue(slot) {
  return `${slot.date}T${slot.start}`;
}

export function initBookingForm(fields, getTutors) {
  const {
    formEl,
    subjectSelect,
    daySelect,
    slotSelect,
    messageInput,
    studentNameInput,
    emailInput,
    statusEl,
  } = fields;

  // Open times for the selected subject, fetched once per subject.
  let slots = [];
  let latestSlotRequest = 0;

  function showStatus(text, kind) {
    statusEl.textContent = text;
    statusEl.classList.toggle('success', kind === 'success');
    statusEl.classList.toggle('error', kind === 'error');
  }

  function populateSubjects() {
    const subjects = [...new Set(getTutors().flatMap((tutor) => tutor.subjects))].sort();
    resetSelect(subjectSelect, 'Choose a subject');
    subjects.forEach((subject) => subjectSelect.add(new Option(subject, subject)));
  }

  function renderTimes() {
    const daySlots = slots.filter((slot) => slot.date === daySelect.value);

    if (daySlots.length === 0) {
      resetSelect(slotSelect, 'Choose a day first');
      slotSelect.disabled = true;
      return;
    }

    resetSelect(slotSelect, 'Choose a time');
    daySlots.forEach((slot) => slotSelect.add(new Option(slot.timeLabel, slotValue(slot))));
    slotSelect.disabled = false;
  }

  function renderDays(preferredDay = '') {
    const days = [...new Map(slots.map((slot) => [slot.date, slot.dateLabel])).entries()];

    if (days.length === 0) {
      resetSelect(daySelect, 'No open times in the next 2 weeks');
      daySelect.disabled = true;
    } else {
      resetSelect(daySelect, 'Choose a day');
      days.forEach(([date, label]) => daySelect.add(new Option(label, date)));
      daySelect.disabled = false;
      if (days.some(([date]) => date === preferredDay)) {
        daySelect.value = preferredDay;
      }
    }

    renderTimes();
  }

  async function loadSlots(preferredDay = '') {
    const subject = subjectSelect.value;
    const requestId = ++latestSlotRequest;
    slots = [];
    daySelect.disabled = true;
    slotSelect.disabled = true;
    resetSelect(slotSelect, 'Choose a day first');

    if (!subject) {
      resetSelect(daySelect, 'Choose a subject first');
      return;
    }

    resetSelect(daySelect, 'Loading available days…');

    try {
      const result = await fetchSlots(subject);
      if (requestId !== latestSlotRequest) return;
      slots = result;
      renderDays(preferredDay);
    } catch (error) {
      if (requestId !== latestSlotRequest) return;
      resetSelect(daySelect, 'Times are unavailable right now');
      showStatus(error.message, 'error');
    }
  }

  function selectedSlot() {
    return slots.find((slot) => slotValue(slot) === slotSelect.value);
  }

  function resetForm() {
    formEl.reset();
    populateSubjects();
    loadSlots();
  }

  subjectSelect.addEventListener('change', () => loadSlots());
  daySelect.addEventListener('change', renderTimes);

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

    try {
      const { booking } = await submitBooking({
        studentName,
        email,
        subject,
        tutorId: ANY_TUTOR,
        date: slot.date,
        start: slot.start,
        message: messageInput.value,
      });

      showStatus(
        `Booked with ${booking.tutorName} for ${slot.dateLabel}, ${slot.timeLabel}. The Student Success Center will confirm your appointment.`,
        'success'
      );
      resetForm();
    } catch (error) {
      showStatus(error.message, 'error');
      if (error.status === 409) {
        loadSlots(slot.date);
      }
    }
  });

  return {
    // Call once the tutor list has loaded.
    refresh: resetForm,
  };
}
