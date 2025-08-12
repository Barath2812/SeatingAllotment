const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rollNumber: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  }
});

const seatingPlanSchema = new mongoose.Schema({
  examId: {
    type: String,
    required: true,
    default: 'FINAL_EXAM_2024'
  },
  hallName: {
    type: String,
    required: true
  },
  row: {
    type: Number,
    required: true
  },
  bench: {
    type: Number,
    required: true
  },
  seat1: {
    type: seatSchema,
    required: true
  },
  seat2: {
    type: seatSchema,
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure unique seating
seatingPlanSchema.index({ examId: 1, hallName: 1, row: 1, bench: 1 }, { unique: true });

module.exports = mongoose.model('SeatingPlan', seatingPlanSchema);
