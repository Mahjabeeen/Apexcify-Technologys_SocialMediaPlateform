const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  membershipPlan: { type: String, enum: ['basic', 'premium', 'annual'], default: 'basic' },
  trainer:     { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' },
  joinDate:    { type: Date, default: Date.now },
  expiryDate:  { type: Date },
  status:      { type: String, enum: ['active', 'inactive', 'suspended', 'pending'], default: 'pending' },
  height:      { type: Number },
  weight:      { type: Number },
  bloodGroup:  { type: String },
  emergencyContact: { name: String, phone: String },
  medicalNotes: { type: String },
  qrCode:      { type: String },
  goals:       [String],
  address:     { type: String },
}, { timestamps: true });

// Virtual: BMI
memberSchema.virtual('bmi').get(function() {
  if (this.height && this.weight) {
    return (this.weight / Math.pow(this.height / 100, 2)).toFixed(1);
  }
  return null;
});

module.exports = mongoose.model('Member', memberSchema);
