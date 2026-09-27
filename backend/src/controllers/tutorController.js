const { filterTutors } = require('../tutorService');
const { formatAvailability, teachesSubject } = require('../scheduleService');
const tutorRepository = require('../db/tutorRepository');

function toPublicTutor(tutor) {
  const { email, ...publicTutor } = tutor;
  return { ...publicTutor, availability: formatAvailability(tutor.availability) };
}

async function listTutors(req, res) {
  try {
    const query = String(req.query.q || '').trim();
    const allTutors = await tutorRepository.findAll();
    const subject = String(req.query.subject || '').trim();
    const tutors = filterTutors(allTutors, query)
      .filter((tutor) => !subject || teachesSubject(tutor, subject))
      .map(toPublicTutor);
    return res.json({ tutors });
  } catch {
    return res.status(500).json({ message: 'Unable to fetch tutors.' });
  }
}

async function getTutor(req, res) {
  try {
    const tutor = await tutorRepository.findById(undefined, req.params.id);

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    return res.json({ tutor: toPublicTutor(tutor) });
  } catch {
    return res.status(500).json({ message: 'Unable to fetch tutor profile.' });
  }
}

module.exports = {
  listTutors,
  getTutor,
};
