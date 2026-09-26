const express = require('express');
const { listSlots } = require('../controllers/slotController');

const router = express.Router();

router.get('/', listSlots);

module.exports = router;
