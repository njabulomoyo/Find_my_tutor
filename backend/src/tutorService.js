function filterTutors(tutors, searchTerm = '') {
  const normalizedTerm = String(searchTerm || '').trim().toLowerCase();

  if (!normalizedTerm) {
    return tutors;
  }

  return tutors.filter((tutor) => {
    const name = String(tutor.name || '').toLowerCase();
    const major = String(tutor.major || '').toLowerCase();
    const subjects = (tutor.subjects || []).join(' ').toLowerCase();
    return name.includes(normalizedTerm)
      || major.includes(normalizedTerm)
      || subjects.includes(normalizedTerm);
  });
}

module.exports = {
  filterTutors,
};
