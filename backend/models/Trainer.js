const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialty:   [String],
  experience:  { type: Number, default: 0 },
  bio:         { type: String },
  certifications: [{ name: String, issuer: String, year: Number }],
  schedule:    [{
    day:       { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] },
    startTime: String,
    endTime:   String,
  }],
  rating:      { type: Number, default: 0, min: 0, max: 5 },
  totalRatings:{ type: Number, default: 0 },
  salary:      { type: Number },
  status:      { type: String, enum: ['active', 'on-leave', 'inactive'], default: 'active' },
  members:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
}, { timestamps: true });

module.exports = mongoose.model('Trainer', trainerSchema);
