const fallbackTutors = [
  { id: 1, name: 'Amar Singh', subject: 'Physics', subjects: ['Physics', 'Calculus', 'General Science'], availability: ['Mon 2:00 PM - 5:00 PM', 'Wed 10:00 AM - 1:00 PM'] },
  { id: 2, name: 'Lerato Khumalo', subject: 'English', subjects: ['English Composition', 'Academic Writing', 'Literature'], availability: ['Tue 9:00 AM - 12:00 PM', 'Thu 1:00 PM - 4:00 PM'] },
  { id: 3, name: 'Johan Pretorius', subject: 'Computer Science', subjects: ['Computer Science', 'Programming', 'Data Structures'], availability: ['Mon 10:00 AM - 1:00 PM', 'Fri 2:00 PM - 5:00 PM'] },
  { id: 4, name: 'Nandi Mokoena', subject: 'Mathematics', subjects: ['Mathematics', 'Calculus', 'Algebra'], availability: ['Tue 2:00 PM - 5:00 PM', 'Thu 9:00 AM - 12:00 PM'] },
  { id: 5, name: 'Thabo Dlamini', subject: 'Chemistry', subjects: ['Chemistry', 'General Science', 'Biology'], availability: ['Mon 9:00 AM - 12:00 PM', 'Wed 2:00 PM - 5:00 PM'] },
  { id: 6, name: 'Maya Naidoo', subject: 'Academic Writing', subjects: ['Academic Writing', 'English Composition', 'Literature'], availability: ['Wed 9:00 AM - 12:00 PM', 'Fri 1:00 PM - 4:00 PM'] }
];

document.addEventListener('DOMContentLoaded', () => {
  const tutorGrid = document.getElementById('tutor-grid');
  const tutorStatus = document.getElementById('tutor-status');
  const subjectSelect = document.getElementById('subject');
  const tutorSelect = document.getElementById('booking-tutor');
  const studentNameInput = document.getElementById('student-name');
  const emailInput = document.getElementById('student-email');
  const dateInput = document.getElementById('date');
  const timeInput = document.getElementById('time');
  const bookingForm = document.getElementById('booking-form');
  const bookingStatus = document.getElementById('booking-status');
  const sidebar = document.getElementById('sidebar');
  const collapseToggle = document.getElementById('collapse-toggle');
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  let tutors = [];

  function normalizeTutor(tutor, index) {
    return {
      ...tutor,
      subjects: tutor.subjects || [tutor.subject],
      availability: tutor.availability || fallbackTutors[index % fallbackTutors.length].availability
    };
  }

  function initials(name) {
    return name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }

  function renderTutors() {
    tutorGrid.innerHTML = tutors.map((tutor) => `
      <article class="tutor-card">
        <div class="avatar">${initials(tutor.name)}</div>
        <h3>${tutor.name}</h3>
        <p class="specialization">${tutor.subject}</p>
        <a class="profile-link" href="./profile.html?id=${encodeURIComponent(tutor.id)}">View tutor profile <span aria-hidden="true">→</span></a>
        <details>
          <summary>View profile details</summary>
          <div class="profile-details">
            <p><strong>Subjects:</strong> ${tutor.subjects.join(', ')}</p>
            <p><strong>Availability:</strong></p>
            ${tutor.availability.map((time) => `<p>${time}</p>`).join('')}
          </div>
        </details>
      </article>
    `).join('');
    tutorStatus.textContent = `${tutors.length} tutors ready to support your goals.`;
  }

  function populateBookingFields() {
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

  async function loadTutors() {
    try {
      const response = await fetch('http://localhost:5050/api/tutors');
      if (!response.ok) throw new Error('Tutor API unavailable');
      const data = await response.json();
      tutors = (data.tutors || []).map(normalizeTutor);
    } catch (error) {
      tutors = fallbackTutors;
      tutorStatus.textContent = 'Showing the current Student Success Center tutor team.';
    }
    renderTutors();
    populateBookingFields();
  }

  collapseToggle.addEventListener('click', () => {
    const collapsed = sidebar.classList.toggle('collapsed');
    collapseToggle.textContent = collapsed ? '→' : '←';
    collapseToggle.setAttribute('aria-expanded', String(!collapsed));
    collapseToggle.setAttribute('aria-label', collapsed ? 'Expand navigation' : 'Collapse navigation');
  });

  mobileMenuToggle.addEventListener('click', () => {
    const open = sidebar.classList.toggle('mobile-open');
    mobileMenuToggle.setAttribute('aria-expanded', String(open));
  });

  sidebar.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    sidebar.classList.remove('mobile-open');
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
    sidebar.querySelectorAll('a').forEach((item) => item.classList.remove('active'));
    link.classList.add('active');
  }));

  bookingForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const selectedTutor = tutors.find((tutor) => String(tutor.id) === tutorSelect.value);
    const subject = subjectSelect.value;
    const date = dateInput.value;
    const time = timeInput.value;
    const message = document.getElementById('message').value;
    const studentName = studentNameInput.value.trim();
    const email = emailInput.value.trim();

    if (!selectedTutor || !subject || !date || !time || !studentName || !email) {
      bookingStatus.textContent = 'Please complete all required booking fields before submitting.';
      bookingStatus.classList.remove('success');
      bookingStatus.classList.add('error');
      return;
    }

    try {
      const response = await fetch('http://localhost:5050/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          email,
          tutorId: selectedTutor.id,
          preferredDate: date,
          preferredTime: time,
          subject,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Booking request could not be submitted.');
      }

      bookingStatus.textContent = `Request noted for ${selectedTutor.name}. The Student Success Center will confirm your appointment.`;
      bookingStatus.classList.remove('error');
      bookingStatus.classList.add('success');
      bookingForm.reset();
      populateBookingFields();
    } catch (error) {
      bookingStatus.textContent = error.message;
      bookingStatus.classList.remove('success');
      bookingStatus.classList.add('error');
    }
  });

  loadTutors();
});
