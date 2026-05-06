const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  subject:     { type: String, default: '' },
  description: { type: String, default: '' },
  dueDate:     { type: Date },
  priority:    { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  status:      { type: String, enum: ['pending', 'progress', 'done', 'overdue'], default: 'pending' },
  assignedTo:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
