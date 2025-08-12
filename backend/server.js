const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: './config.env' });

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const studentRoutes = require('./routes/student');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    
    // Create default admin user if not exists
    createDefaultAdmin();
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Create default admin user
async function createDefaultAdmin() {
  try {
    const User = require('./models/User');
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      const adminUser = new User({
        name: 'Admin User',
        role: 'admin',
        rollNumber: 'ADMIN001',
        department: 'Administration',
        email: 'admin@smartseating.com',
        passwordHash: 'admin123'
      });
      
      await adminUser.save();
      console.log('Default admin user created');
      console.log('Email: admin@smartseating.com');
      console.log('Password: admin123');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
    // Don't crash the server if admin creation fails
  }
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  if (error.name === 'MulterError') {
    return res.status(400).json({ message: 'File upload error: ' + error.message });
  }
  
  if (error.message.includes('Only Excel files are allowed')) {
    return res.status(400).json({ message: 'Only Excel files (.xlsx, .xls) are allowed' });
  }
  
  res.status(500).json({ message: 'Internal server error' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Smart Seating Solutions API is running',
    timestamp: new Date().toISOString()
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API URL: http://localhost:${PORT}/api`);
});
