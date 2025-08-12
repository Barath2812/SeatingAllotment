const express = require('express');
const multer = require('multer');
const { adminAuth } = require('../middleware/auth');
const {
  uploadStudents,
  uploadHalls,
  generateSeating,
  getSeatingPlan,
  exportToExcel,
  exportToPDF,
  sendNotifications,
  getDashboardStats,
  deleteStudents,
  deleteHalls,
  deleteAllStudents,
  resetExcelStudentPasswords,
  fixStudentPassword
} = require('../controllers/adminController');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'), false);
    }
  }
});

// Apply admin authentication to all routes
router.use(adminAuth);

// Dashboard stats
router.get('/dashboard/stats', getDashboardStats);

// Upload students from Excel
router.post('/upload/students', upload.single('file'), uploadStudents);

// Upload halls from Excel
router.post('/upload/halls', upload.single('file'), uploadHalls);

// Generate seating allocation
router.post('/generate-seating', generateSeating);

// Get seating plan
router.get('/seating-plan', getSeatingPlan);

// Export seating plan to Excel
router.get('/export/excel', exportToExcel);

// Export seating plan to PDF
router.get('/export/pdf', exportToPDF);

// Send email notifications
router.post('/send-notifications', sendNotifications);

// Delete students
router.delete('/delete/students', deleteStudents);

// Delete halls
router.delete('/delete/halls', deleteHalls);

// Delete all students (both Excel and manual)
router.delete('/delete/all-students', deleteAllStudents);

// Reset passwords for Excel-uploaded students
router.post('/reset-excel-passwords', resetExcelStudentPasswords);

// Fix password for specific student
router.post('/fix-student-password/:rollNumber', fixStudentPassword);

module.exports = router;
