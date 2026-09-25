export function initials(name) {
  return name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

export function renderTutorCard(tutor) {
  return `
      <article class="tutor-card">
        ${tutor.image
          ? `<img class="tutor-image" src="${tutor.image}" alt="${tutor.name}" />`
          : `<div class="avatar tutor-image-fallback" aria-hidden="true">${initials(tutor.name)}</div>`}
        <h3>${tutor.name}</h3>
        <p class="tutor-meta"><strong>Major:</strong> ${tutor.major}</p>
        <p class="tutor-meta"><strong>Classification:</strong> ${tutor.classification}</p>
        <details>
          <summary>View profile details</summary>
          <div class="profile-details">
            <p><strong>Subjects:</strong> ${tutor.subjects.join(', ')}</p>
            <p><strong>Availability:</strong></p>
            ${tutor.availability.map((time) => `<p>${time}</p>`).join('')}
          </div>
        </details>
      </article>
    `;
}
