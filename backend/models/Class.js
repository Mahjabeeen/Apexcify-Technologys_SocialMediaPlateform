const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String },
  trainer:     { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', required: true },
  category:    { type: String, enum: ['yoga','hiit','strength','cardio','zumba','pilates','crossfit','other'], default: 'other' },
  schedule: [{
    day:       { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] },
    startTime: { type: String, required: true },
    endTime:   { type: String, required: true },
  }],
  capacity:    { type: Number, required: true, default: 20 },
  enrolled:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
  level:       { type: String, enum: ['beginner','intermediate','advanced'], default: 'beginner' },
  duration:    { type: Number, default: 60 },
  color:       { type: String, default: '#ff4d1c' },
  isActive:    { type: Boolean, default: true },
  location:    { type: String, default: 'Main Hall' },
}, { timestamps: true });

classSchema.virtual('spotsLeft').get(function() {
  return this.capacity - this.enrolled.length;
});

module.exports = mongoose.model('Class', classSchema);
