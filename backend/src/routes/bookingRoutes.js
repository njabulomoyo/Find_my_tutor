const express = require('express');
const { createBookingRequest } = require('../controllers/bookingController');

const router = express.Router();

router.post('/', createBookingRequest);

module.exports = router;
