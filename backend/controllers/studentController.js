const SeatingPlan = require('../models/SeatingPlan');
const User = require('../models/User');
const jsPDF = require('jspdf');

const getSeatDetails = async (req, res) => {
  try {
    const studentId = req.user._id;
    
    // Find the seating allocation for this student
    const seatingAllocation = await SeatingPlan.findOne({
      $or: [
        { 'seat1.studentId': studentId },
        { 'seat2.studentId': studentId }
      ]
    });

    if (!seatingAllocation) {
      return res.status(404).json({ 
        message: 'No seating allocation found for this student. Please contact the administrator.' 
      });
    }

    // Determine seat position (left or right)
    const isSeat1 = seatingAllocation.seat1.studentId.toString() === studentId.toString();
    const seatPosition = isSeat1 ? 'Left' : 'Right';
    const seatData = isSeat1 ? seatingAllocation.seat1 : seatingAllocation.seat2;

    // Get the other student on the same bench
    const otherSeatData = isSeat1 ? seatingAllocation.seat2 : seatingAllocation.seat1;
    const otherStudent = await User.findById(otherSeatData.studentId);

    const seatDetails = {
      examName: 'IAT-1',
      hallName: seatingAllocation.hallName,
      row: seatingAllocation.row,
      bench: seatingAllocation.bench,
      seatPosition,
      studentDetails: {
        rollNumber: seatData.rollNumber,
        name: req.user.name,
        department: seatData.department,
        email: req.user.email
      },
      benchMate: otherStudent ? {
        rollNumber: otherSeatData.rollNumber,
        name: otherStudent.name,
        department: otherSeatData.department
      } : null
    };

    res.json(seatDetails);
  } catch (error) {
    console.error('Get seat details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const generateAdmitCard = async (req, res) => {
  try {
    const studentId = req.user._id;
    
    // Get seat details
    const seatingAllocation = await SeatingPlan.findOne({
      $or: [
        { 'seat1.studentId': studentId },
        { 'seat2.studentId': studentId }
      ]
    });

    if (!seatingAllocation) {
      return res.status(404).json({ 
        message: 'No seating allocation found for this student.' 
      });
    }

    const isSeat1 = seatingAllocation.seat1.studentId.toString() === studentId.toString();
    const seatPosition = isSeat1 ? 'Left' : 'Right';

    // Create PDF
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text('Smart Seating Solutions', 105, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text('ADMIT CARD', 105, 35, { align: 'center' });
    
    // Student Information
    doc.setFontSize(12);
    doc.setTextColor(52, 73, 94);
    doc.text('Student Information:', 20, 55);
    
    doc.setFontSize(10);
    doc.text(`Name: ${req.user.name}`, 20, 70);
    doc.text(`Roll Number: ${req.user.rollNumber}`, 20, 80);
    doc.text(`Department: ${req.user.department}`, 20, 90);
    doc.text(`Email: ${req.user.email}`, 20, 100);
    
    // Exam Information
    doc.setFontSize(12);
    doc.text('Exam Information:', 20, 120);
    
    doc.setFontSize(10);
          doc.text(`Exam Name: IAT-1`, 20, 135);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 145);
    doc.text(`Time: 9:00 AM - 12:00 PM`, 20, 155);
    
    // Seating Information
    doc.setFontSize(12);
    doc.text('Seating Information:', 20, 175);
    
    doc.setFontSize(10);
    doc.text(`Hall: ${seatingAllocation.hallName}`, 20, 190);
    doc.text(`Row: ${seatingAllocation.row}`, 20, 200);
    doc.text(`Bench: ${seatingAllocation.bench}`, 20, 210);
    doc.text(`Seat Position: ${seatPosition}`, 20, 220);
    
    // Instructions
    doc.setFontSize(12);
    doc.text('Important Instructions:', 20, 240);
    
    doc.setFontSize(8);
    doc.text('1. Please arrive at least 30 minutes before the exam time.', 20, 250);
    doc.text('2. Bring your own stationery and calculator if required.', 20, 255);
    doc.text('3. Mobile phones and electronic devices are not allowed.', 20, 260);
    doc.text('4. Follow all examination rules and regulations.', 20, 265);
    
    // Footer
    doc.setFontSize(8);
    doc.text('Generated on: ' + new Date().toLocaleString(), 20, 280);
    doc.text('Smart Seating Solutions - Automated Seating Allocation System', 105, 280, { align: 'center' });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=admit-card-${req.user.rollNumber}.pdf`);
    
    // Send PDF
    res.send(doc.output());
  } catch (error) {
    console.error('Generate admit card error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getSeatDetails,
  generateAdmitCard
};
