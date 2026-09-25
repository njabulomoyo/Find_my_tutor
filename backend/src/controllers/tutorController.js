const { filterTutors } = require('../tutorService');
const tutorRepository = require('../db/tutorRepository');

async function listTutors(req, res) {
  try {
    const query = String(req.query.q || '').trim();
    const allTutors = await tutorRepository.findAll();
    const tutors = filterTutors(allTutors, query);
    return res.json({ tutors });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch tutors.' });
  }
}

async function getTutor(req, res) {
  try {
    const tutor = await tutorRepository.findById(undefined, req.params.id);

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    return res.json({ tutor });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch tutor profile.' });
  }
}

module.exports = {
  listTutors,
  getTutor,
};
