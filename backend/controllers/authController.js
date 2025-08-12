const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase(), role: 'admin' });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Admin login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const studentLogin = async (req, res) => {
  try {
    const { rollNumber, password } = req.body;

    if (!rollNumber || !password) {
      return res.status(400).json({ message: 'Roll number and password are required' });
    }

    console.log('Login attempt for roll number:', rollNumber);

    // First, let's check if any student with this roll number exists
    const allStudents = await User.find({ rollNumber: rollNumber.trim() });
    console.log('All users with this roll number:', allStudents.map(s => ({ 
      rollNumber: s.rollNumber, 
      role: s.role, 
      source: s.source,
      hasPassword: !!s.passwordHash 
    })));

    const user = await User.findOne({ rollNumber: rollNumber.trim(), role: 'student', source: 'excel' });
    if (!user) {
      // Check if student exists but with different source
      const studentWithDifferentSource = await User.findOne({ rollNumber: rollNumber.trim(), role: 'student' });
      if (studentWithDifferentSource) {
        return res.status(401).json({ 
          message: `Student found but not from Excel upload. Source: ${studentWithDifferentSource.source}` 
        });
      }
      return res.status(401).json({ message: 'Invalid credentials. Please check your roll number and password.' });
    }

    console.log('Found user:', { 
      rollNumber: user.rollNumber, 
      source: user.source, 
      hasPassword: !!user.passwordHash 
    });

    const isPasswordValid = await user.comparePassword(password);
    console.log('Password validation result:', isPasswordValid);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Student login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        rollNumber: user.rollNumber,
        department: user.department,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const adminSignup = async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    if (!name || !email || !password || !department) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin account already exists. Only one admin is allowed.' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create admin user
    const adminUser = new User({
      name,
      email: email.toLowerCase(),
      passwordHash: password,
      role: 'admin',
      rollNumber: 'ADMIN001',
      department
    });

    await adminUser.save();

    const token = generateToken(adminUser._id);

    res.status(201).json({
      message: 'Admin account created successfully',
      token,
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error('Admin signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



module.exports = {
  adminLogin,
  studentLogin,
  getProfile,
  adminSignup
};
