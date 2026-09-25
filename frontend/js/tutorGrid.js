import { renderTutorCard } from './tutorCard.js';

export function renderTutorGrid(tutors, { gridEl, statusEl }) {
  gridEl.innerHTML = tutors.map(renderTutorCard).join('');
  statusEl.textContent = `${tutors.length} tutors ready to support your goals.`;
}
