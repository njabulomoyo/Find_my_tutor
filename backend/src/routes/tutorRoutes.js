const express = require('express');
const { listTutors, getTutor } = require('../controllers/tutorController');

const router = express.Router();

router.get('/', listTutors);
router.get('/:id', getTutor);

module.exports = router;
