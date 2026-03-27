const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  sets:        { type: Number },
  reps:        { type: String },
  duration:    { type: String },
  restTime:    { type: String },
  notes:       { type: String },
  videoUrl:    { type: String },
});

const workoutPlanSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  trainer:     { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', required: true },
  level:       { type: String, enum: ['beginner','intermediate','advanced'], default: 'beginner' },
  category:    { type: String, enum: ['strength','cardio','flexibility','hiit','yoga','other'], default: 'other' },
  duration:    { type: Number, default: 45 },
  daysPerWeek: { type: Number, default: 3 },
  exercises:   [exerciseSchema],
  assignedTo:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
  file:        { type: String },
  isPublic:    { type: Boolean, default: false },
}, { timestamps: true });

const dietPlanSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  trainer:     { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', required: true },
  goal:        { type: String, enum: ['weight_loss','muscle_gain','maintenance','endurance'], default: 'maintenance' },
  calories:    { type: Number },
  meals: [{
    name:      String,
    time:      String,
    items:     [{ food: String, quantity: String, calories: Number }],
  }],
  assignedTo:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
  file:        { type: String },
}, { timestamps: true });

module.exports = {
  WorkoutPlan: mongoose.model('WorkoutPlan', workoutPlanSchema),
  DietPlan:    mongoose.model('DietPlan', dietPlanSchema),
};
