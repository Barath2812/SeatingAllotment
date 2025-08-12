const express = require('express');
const { studentAuth } = require('../middleware/auth');
const { getSeatDetails, generateAdmitCard } = require('../controllers/studentController');

const router = express.Router();

// Apply student authentication to all routes
router.use(studentAuth);

// Get seat details
router.get('/seat-details', getSeatDetails);

// Generate admit card
router.get('/admit-card', generateAdmitCard);

module.exports = router;
