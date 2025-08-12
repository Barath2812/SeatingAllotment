const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'student'],
    required: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  source: {
    type: String,
    enum: ['manual', 'excel'],
    default: 'manual'
  }
}, {
  timestamps: true
});

// Hash password before saving (only for non-Excel students)
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  
  // Don't hash passwords for Excel-uploaded students (keep them plain text)
  if (this.source === 'excel') {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  // Check if the stored password is hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
  if (this.passwordHash.startsWith('$2a$') || this.passwordHash.startsWith('$2b$') || this.passwordHash.startsWith('$2y$')) {
    // Password is hashed, use bcrypt.compare
    return bcrypt.compare(candidatePassword, this.passwordHash);
  } else {
    // Password is plain text, do direct comparison
    return candidatePassword === this.passwordHash;
  }
};

module.exports = mongoose.model('User', userSchema);
