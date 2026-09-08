function filterTutors(tutors, searchTerm = '') {
  const normalizedTerm = String(searchTerm || '').trim().toLowerCase();

  if (!normalizedTerm) {
    return tutors;
  }

  return tutors.filter((tutor) => {
    const name = String(tutor.name || '').toLowerCase();
    const subject = String(tutor.subject || '').toLowerCase();
    return name.includes(normalizedTerm) || subject.includes(normalizedTerm);
  });
}

module.exports = {
  filterTutors,
};
