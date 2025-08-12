const express = require('express');
const { adminLogin, studentLogin, getProfile, adminSignup } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Admin routes
router.post('/admin/login', adminLogin);
router.post('/admin/signup', adminSignup);

// Student routes
router.post('/student/login', studentLogin);

// Debug endpoint to check students (remove in production)
router.get('/debug/students', async (req, res) => {
  try {
    const User = require('../models/User');
    const students = await User.find({ role: 'student' }).select('rollNumber name source email department');
    res.json({ 
      totalStudents: students.length,
      students: students 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students' });
  }
});

// Get user profile (protected route)
router.get('/profile', auth, getProfile);

module.exports = router;
