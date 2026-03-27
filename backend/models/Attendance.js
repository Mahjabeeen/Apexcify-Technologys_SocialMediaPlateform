const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  member:    { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  class:     { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  date:      { type: Date, default: Date.now },
  checkIn:   { type: Date },
  checkOut:  { type: Date },
  status:    { type: String, enum: ['present', 'absent', 'late', 'excused'], default: 'present' },
  method:    { type: String, enum: ['manual', 'qr'], default: 'manual' },
  markedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes:     { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
