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
    subjectSelect.innerHTML = '<option value="">Choose a subject</option>';
    subjects.forEach((subject) => subjectSelect.add(new Option(subject, subject)));
    tutorSelect.innerHTML = '<option value="">Choose a tutor</option>';
    tutors.forEach((tutor) => tutorSelect.add(new Option(tutor.name, tutor.id)));
  }

  async function loadTutors() {
    try {
      const response = await fetch('http://localhost:5000/api/tutors');
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

  bookingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const selectedTutor = tutors.find((tutor) => String(tutor.id) === tutorSelect.value);
    bookingStatus.textContent = `Request noted for ${selectedTutor ? selectedTutor.name : 'your selected tutor'}. The Student Success Center will confirm the appointment.`;
    bookingStatus.classList.add('success');
  });

  loadTutors();
});
