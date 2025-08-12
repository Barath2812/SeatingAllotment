const User = require('../models/User');
const Hall = require('../models/Hall');
const SeatingPlan = require('../models/SeatingPlan');
const ExcelParser = require('../utils/excelParser');
const SeatingAllocator = require('../utils/seatingAllocator');
const ExcelJS = require('exceljs');
const jsPDF = require('jspdf');
const nodemailer = require('nodemailer');

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  // Add timeout and retry settings
  connectionTimeout: 60000,
  greetingTimeout: 30000,
  socketTimeout: 60000
});

const uploadStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an Excel file' });
    }

    const students = ExcelParser.parseStudentFile(req.file.buffer);
    
    // Check for duplicate roll numbers in the Excel file itself
    const rollNumbers = students.map(s => s.rollNumber);
    const duplicateRollNumbers = rollNumbers.filter((rollNumber, index) => rollNumbers.indexOf(rollNumber) !== index);
    
    if (duplicateRollNumbers.length > 0) {
      return res.status(400).json({ 
        message: `Duplicate roll numbers found in Excel file: ${duplicateRollNumbers.join(', ')}` 
      });
    }

    // Check for existing roll numbers in the database (both manual and excel)
    const existingRollNumbers = await User.find({ 
      rollNumber: { $in: rollNumbers } 
    }).select('rollNumber source');

    if (existingRollNumbers.length > 0) {
      const existingRolls = existingRollNumbers.map(u => u.rollNumber);
      return res.status(400).json({ 
        message: `Roll numbers already exist in database: ${existingRolls.join(', ')}. Please remove them first or use different roll numbers.` 
      });
    }

    // Clear existing Excel-uploaded students only
    await User.deleteMany({ role: 'student', source: 'excel' });

    // Create users for each student with plain text password (no hashing)
    const usersToCreate = students.map(student => ({
      ...student,
      role: 'student',
      passwordHash: 'student123', // Plain text password
      source: 'excel' // Flag to identify Excel-uploaded students
    }));

    // Insert new students using insertMany (no pre-save hook needed)
    const createdUsers = await User.insertMany(usersToCreate);

    res.json({
      message: `${createdUsers.length} students uploaded successfully with default password: student123`,
      count: createdUsers.length
    });
  } catch (error) {
    console.error('Upload students error:', error);
    
    // Handle MongoDB duplicate key error specifically
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      res.status(400).json({ 
        message: `Duplicate ${field}: ${value}. This roll number already exists in the database.` 
      });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};

const uploadHalls = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an Excel file' });
    }

    const halls = ExcelParser.parseHallFile(req.file.buffer);
    
    // Clear existing halls
    await Hall.deleteMany({});

    // Insert new halls
    const createdHalls = await Hall.insertMany(halls);

    res.json({
      message: `${createdHalls.length} halls uploaded successfully`,
      count: createdHalls.length
    });
  } catch (error) {
    console.error('Upload halls error:', error);
    res.status(400).json({ message: error.message });
  }
};

const generateSeating = async (req, res) => {
  try {
    // Only use Excel-uploaded students for seating allocation
    const students = await User.find({ role: 'student', source: 'excel' });
    const halls = await Hall.find({});

    if (students.length === 0) {
      return res.status(400).json({ message: 'No students found. Please upload students first.' });
    }

    if (halls.length === 0) {
      return res.status(400).json({ message: 'No halls found. Please upload halls first.' });
    }

    // Clear existing seating plan
    await SeatingPlan.deleteMany({});

    // Generate new seating plan
    const seatingPlan = SeatingAllocator.allocateSeats(students, halls);

    // Validate seating plan
    const validationErrors = SeatingAllocator.validateSeatingPlan(seatingPlan);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: 'Seating allocation validation failed', 
        errors: validationErrors 
      });
    }

    // Save seating plan to database
    const createdSeatingPlan = await SeatingPlan.insertMany(seatingPlan);

    res.json({
      message: 'Seating allocation generated successfully',
      totalBenches: createdSeatingPlan.length,
      totalStudents: students.length,
      totalHalls: halls.length
    });
  } catch (error) {
    console.error('Generate seating error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getSeatingPlan = async (req, res) => {
  try {
    const seatingPlan = await SeatingPlan.find({}).sort({ hallName: 1, row: 1, bench: 1 });
    
    // Group by hall for better organization
    const groupedSeating = seatingPlan.reduce((acc, seat) => {
      if (!acc[seat.hallName]) {
        acc[seat.hallName] = [];
      }
      acc[seat.hallName].push(seat);
      return acc;
    }, {});

    res.json({
      seatingPlan: groupedSeating,
      totalBenches: seatingPlan.length
    });
  } catch (error) {
    console.error('Get seating plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const exportToExcel = async (req, res) => {
  try {
    const seatingPlan = await SeatingPlan.find({}).sort({ hallName: 1, row: 1, bench: 1 });
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Seating Plan');

    // Add headers
    worksheet.columns = [
      { header: 'Hall Name', key: 'hallName', width: 15 },
      { header: 'Row', key: 'row', width: 10 },
      { header: 'Bench', key: 'bench', width: 10 },
      { header: 'Seat 1 - Roll No', key: 'seat1Roll', width: 15 },
      { header: 'Seat 1 - Name', key: 'seat1Name', width: 20 },
      { header: 'Seat 1 - Department', key: 'seat1Dept', width: 15 },
      { header: 'Seat 2 - Roll No', key: 'seat2Roll', width: 15 },
      { header: 'Seat 2 - Name', key: 'seat2Name', width: 20 },
      { header: 'Seat 2 - Department', key: 'seat2Dept', width: 15 }
    ];

    // Add data
    for (const seat of seatingPlan) {
      const seat1Student = await User.findById(seat.seat1.studentId);
      const seat2Student = await User.findById(seat.seat2.studentId);
      
      worksheet.addRow({
        hallName: seat.hallName,
        row: seat.row,
        bench: seat.bench,
        seat1Roll: seat.seat1.rollNumber,
        seat1Name: seat1Student ? seat1Student.name : 'N/A',
        seat1Dept: seat.seat1.department,
        seat2Roll: seat.seat2.rollNumber,
        seat2Name: seat2Student ? seat2Student.name : 'N/A',
        seat2Dept: seat.seat2.department
      });
    }

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=seating-plan.xlsx');

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export to Excel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const exportToPDF = async (req, res) => {
  try {
    const seatingPlan = await SeatingPlan.find({}).sort({ hallName: 1, row: 1, bench: 1 });
    
    const doc = new jsPDF();
    let yPos = 20;
    let page = 1;

    doc.setFontSize(16);
    doc.text('Smart Seating Solutions - Seating Plan', 20, yPos);
    yPos += 20;

    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPos);
    yPos += 15;

    for (const seat of seatingPlan) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
        page++;
      }

      const seat1Student = await User.findById(seat.seat1.studentId);
      const seat2Student = await User.findById(seat.seat2.studentId);

      doc.setFontSize(10);
      doc.text(`Hall: ${seat.hallName} | Row: ${seat.row} | Bench: ${seat.bench}`, 20, yPos);
      yPos += 8;
      doc.text(`Seat 1: ${seat.seat1.rollNumber} - ${seat1Student ? seat1Student.name : 'N/A'} (${seat.seat1.department})`, 25, yPos);
      yPos += 8;
      doc.text(`Seat 2: ${seat.seat2.rollNumber} - ${seat2Student ? seat2Student.name : 'N/A'} (${seat.seat2.department})`, 25, yPos);
      yPos += 12;
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=seating-plan.pdf');
    res.send(doc.output());
  } catch (error) {
    console.error('Export to PDF error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const sendNotifications = async (req, res) => {
  try {
    const seatingPlan = await SeatingPlan.find({});
    const sentEmails = [];
    const failedEmails = [];

    for (const seat of seatingPlan) {
      try {
        const seat1Student = await User.findById(seat.seat1.studentId);
        const seat2Student = await User.findById(seat.seat2.studentId);

        // Send email to seat 1 student
        if (seat1Student) {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: seat1Student.email,
            subject: 'Exam Seating Allocation - Smart Seating Solutions',
            html: `
              <h2>Exam Seating Allocation</h2>
              <p>Dear ${seat1Student.name},</p>
              <p>Your seating allocation for the IAT-1 has been assigned:</p>
              <ul>
                <li><strong>Hall:</strong> ${seat.hallName}</li>
                <li><strong>Row:</strong> ${seat.row}</li>
                <li><strong>Bench:</strong> ${seat.bench}</li>
                <li><strong>Seat Position:</strong> Left</li>
              </ul>
              <p>Please arrive at least 30 minutes before the exam time.</p>
              <p>Best regards,<br>Smart Seating Solutions</p>
            `
          };

          await transporter.sendMail(mailOptions);
          sentEmails.push(seat1Student.email);
        }

        // Send email to seat 2 student
        if (seat2Student) {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: seat2Student.email,
            subject: 'Exam Seating Allocation - Smart Seating Solutions',
            html: `
              <h2>Exam Seating Allocation</h2>
              <p>Dear ${seat2Student.name},</p>
              <p>Your seating allocation for the IAT-1 has been assigned:</p>
              <ul>
                <li><strong>Hall:</strong> ${seat.hallName}</li>
                <li><strong>Row:</strong> ${seat.row}</li>
                <li><strong>Bench:</strong> ${seat.bench}</li>
                <li><strong>Seat Position:</strong> Right</li>
              </ul>
              <p>Please arrive at least 30 minutes before the exam time.</p>
              <p>Best regards,<br>Smart Seating Solutions</p>
            `
          };

          await transporter.sendMail(mailOptions);
          sentEmails.push(seat2Student.email);
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        failedEmails.push(seat.seat1.rollNumber, seat.seat2.rollNumber);
      }
    }

    res.json({
      message: 'Notifications sent',
      sentCount: sentEmails.length,
      failedCount: failedEmails.length,
      sentEmails,
      failedEmails
    });
  } catch (error) {
    console.error('Send notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const studentCount = await User.countDocuments({ role: 'student', source: 'excel' });
    const hallCount = await Hall.countDocuments({});
    const seatingCount = await SeatingPlan.countDocuments({});
    const totalCapacity = await Hall.aggregate([
      { $group: { _id: null, total: { $sum: '$capacity' } } }
    ]);

    res.json({
      studentCount,
      hallCount,
      seatingCount,
      totalCapacity: totalCapacity[0]?.total || 0
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteStudents = async (req, res) => {
  try {
    // Delete all Excel students
    const result = await User.deleteMany({ role: 'student', source: 'excel' });
    
    // Also delete any seating plans since students are deleted
    await SeatingPlan.deleteMany({});

    res.json({
      message: `${result.deletedCount} students deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Delete students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteHalls = async (req, res) => {
  try {
    // Delete all halls
    const result = await Hall.deleteMany({});
    
    // Also delete any seating plans since halls are deleted
    await SeatingPlan.deleteMany({});

    res.json({
      message: `${result.deletedCount} halls deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Delete halls error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteAllStudents = async (req, res) => {
  try {
    // Delete all students (both Excel and manual)
    const result = await User.deleteMany({ role: 'student' });
    
    // Also delete any seating plans since students are deleted
    await SeatingPlan.deleteMany({});

    res.json({
      message: `${result.deletedCount} students deleted successfully (both Excel and manual)`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Delete all students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const resetExcelStudentPasswords = async (req, res) => {
  try {
    // Find all Excel-uploaded students
    const excelStudents = await User.find({ role: 'student', source: 'excel' });
    
    if (excelStudents.length === 0) {
      return res.status(404).json({ message: 'No Excel-uploaded students found' });
    }

    // Set plain text password (no hashing)
    const plainPassword = 'student123';

    // Update all Excel students with the plain text password
    const updateResult = await User.updateMany(
      { role: 'student', source: 'excel' },
      { passwordHash: plainPassword }
    );

    console.log(`Reset passwords for ${updateResult.modifiedCount} students to plain text: ${plainPassword}`);

    res.json({
      message: `Password reset successfully for ${updateResult.modifiedCount} Excel-uploaded students. Default password: student123`,
      modifiedCount: updateResult.modifiedCount
    });
  } catch (error) {
    console.error('Reset passwords error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const fixStudentPassword = async (req, res) => {
  try {
    const { rollNumber } = req.params;
    
    // Find the specific student
    const student = await User.findOne({ rollNumber, role: 'student', source: 'excel' });
    
    if (!student) {
      return res.status(404).json({ message: `Student with roll number ${rollNumber} not found` });
    }

    // Set plain text password (no hashing)
    const plainPassword = 'student123';

    // Update the student's password
    student.passwordHash = plainPassword;
    await student.save();

    console.log(`Fixed password for student ${rollNumber} to plain text: ${plainPassword}`);

    res.json({
      message: `Password fixed for student ${rollNumber}. Default password: student123`,
      rollNumber
    });
  } catch (error) {
    console.error('Fix student password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
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
};
