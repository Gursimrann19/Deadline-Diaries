const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  emoji:       { type: String, default: '🗂️' },
  description: { type: String, default: '' },
  dueDate:     { type: Date },
  status:      { type: String, enum: ['planning', 'in_progress', 'done'], default: 'in_progress' },
  members:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  progress:    { type: Number, min: 0, max: 100, default: 0 },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
