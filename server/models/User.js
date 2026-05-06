const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role:         { type: String, enum: ['student', 'instructor'], default: 'student' },
  department:   { type: String, default: 'Computer Science Engineering' },
  studentId:    { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
