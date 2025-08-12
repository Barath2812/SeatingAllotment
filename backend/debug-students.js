const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: './config.env' });

async function debugStudents() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all students
    const students = await User.find({ role: 'student' });
    console.log(`\nTotal students found: ${students.length}`);

    if (students.length === 0) {
      console.log('\n❌ No students found in database!');
      console.log('You need to upload students via Excel first.');
      return;
    }

    // Group by source
    const excelStudents = students.filter(s => s.source === 'excel');
    const manualStudents = students.filter(s => s.source === 'manual');

    console.log(`\n📊 Breakdown:`);
    console.log(`- Excel students: ${excelStudents.length}`);
    console.log(`- Manual students: ${manualStudents.length}`);

    // Show first few students
    console.log('\n📋 First 5 students:');
    students.slice(0, 5).forEach((student, index) => {
      console.log(`${index + 1}. Roll: ${student.rollNumber} | Name: ${student.name} | Source: ${student.source} | Has Password: ${!!student.passwordHash}`);
    });

    // Test password for first student
    if (excelStudents.length > 0) {
      const testStudent = excelStudents[0];
      console.log(`\n🔐 Testing password for ${testStudent.rollNumber}:`);
      
      const bcrypt = require('bcryptjs');
      const isPasswordValid = await bcrypt.compare('student123', testStudent.passwordHash);
      console.log(`- Password 'student123' valid: ${isPasswordValid}`);
      
      // Also test with plain text (in case it wasn't hashed)
      const isPlainTextValid = testStudent.passwordHash === 'student123';
      console.log(`- Password 'student123' matches plain text: ${isPlainTextValid}`);
    }

    // Check for roll number "1" specifically
    const rollNumberOne = students.find(s => s.rollNumber === '1');
    if (rollNumberOne) {
      console.log(`\n🎯 Found roll number "1":`);
      console.log(`- Name: ${rollNumberOne.name}`);
      console.log(`- Source: ${rollNumberOne.source}`);
      console.log(`- Has Password: ${!!rollNumberOne.passwordHash}`);
      
      if (rollNumberOne.source === 'excel') {
        const bcrypt = require('bcryptjs');
        const isPasswordValid = await bcrypt.compare('student123', rollNumberOne.passwordHash);
        console.log(`- Password 'student123' valid: ${isPasswordValid}`);
      }
    } else {
      console.log('\n❌ Roll number "1" not found!');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

debugStudents();
