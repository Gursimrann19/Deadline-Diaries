const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  date:     { type: Date, required: true },
  course:   { type: String, required: true },
  students: [{
    user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['present', 'absent'], default: 'present' }
  }],
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
