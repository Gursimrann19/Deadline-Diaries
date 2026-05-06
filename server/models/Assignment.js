const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  filename:     { type: String, required: true },
  fileSize:     { type: Number, required: true },
  fileUrl:      { type: String, required: true },
  subject:      { type: String, default: '' },
  submittedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:       { type: String, enum: ['submitted', 'under_review', 'graded'], default: 'submitted' },
  grade:        { type: String, default: '' },
  feedback:     { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
