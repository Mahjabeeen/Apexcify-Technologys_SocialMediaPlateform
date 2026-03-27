const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config();

const User = require('../models/User');
const Member = require('../models/Member');
const Trainer = require('../models/Trainer');
const Class = require('../models/Class');
const Payment = require('../models/Payment');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('🌱 Seeding database...');

  // Clear all
  await Promise.all([User.deleteMany(), Member.deleteMany(), Trainer.deleteMany(), Class.deleteMany(), Payment.deleteMany()]);

  // Admin
  const admin = await User.create({ name: 'Admin FitCore', email: 'admin@fitcore.com', password: 'admin123', role: 'admin', phone: '+92-300-0000000' });

  // Trainers
  const trainerUsers = await User.create([
    { name: 'Bilal Ahmed',   email: 'bilal@fitcore.com',   password: 'trainer123', role: 'trainer', phone: '+92-311-1111111' },
    { name: 'Sara Malik',    email: 'sara@fitcore.com',    password: 'trainer123', role: 'trainer', phone: '+92-333-2222222' },
    { name: 'Ali Hassan',    email: 'ali@fitcore.com',     password: 'trainer123', role: 'trainer', phone: '+92-345-3333333' },
    { name: 'Mehwish Iqbal', email: 'mehwish@fitcore.com', password: 'trainer123', role: 'trainer', phone: '+92-321-4444444' },
  ]);

  const trainers = await Trainer.create([
    { user: trainerUsers[0]._id, specialty: ['Strength & Conditioning', 'Powerlifting'], experience: 6, rating: 4.9, totalRatings: 45, bio: 'Certified strength coach with 6 years experience', status: 'active', salary: 80000, schedule: [{ day: 'Monday', startTime: '09:00', endTime: '17:00' }, { day: 'Wednesday', startTime: '09:00', endTime: '17:00' }] },
    { user: trainerUsers[1]._id, specialty: ['Yoga', 'Flexibility', 'Meditation'], experience: 4, rating: 4.7, totalRatings: 30, status: 'active', salary: 70000 },
    { user: trainerUsers[2]._id, specialty: ['CrossFit', 'HIIT', 'Functional Training'], experience: 8, rating: 4.8, totalRatings: 60, status: 'active', salary: 90000 },
    { user: trainerUsers[3]._id, specialty: ['Cardio', 'Zumba', 'Dance Fitness'], experience: 3, rating: 4.6, totalRatings: 25, status: 'on-leave', salary: 65000 },
  ]);

  // Members
  const memberUsers = await User.create([
    { name: 'Ayesha Khan',    email: 'ayesha@email.com',  password: 'member123', role: 'member', phone: '+92-311-5556677' },
    { name: 'Usman Tariq',   email: 'usman@email.com',   password: 'member123', role: 'member', phone: '+92-333-9876543' },
    { name: 'Fatima Noor',   email: 'fatima@email.com',  password: 'member123', role: 'member', phone: '+92-300-1112233' },
    { name: 'Hamza Raza',    email: 'hamza@email.com',   password: 'member123', role: 'member', phone: '+92-345-4445566' },
    { name: 'Zara Siddiqui', email: 'zara@email.com',    password: 'member123', role: 'member', phone: '+92-321-7778899' },
    { name: 'Omar Sheikh',   email: 'omar@email.com',    password: 'member123', role: 'member', phone: '+92-312-0001122' },
  ]);

  const members = await Member.create([
    { user: memberUsers[0]._id, membershipPlan: 'premium', trainer: trainers[0]._id, status: 'active', height: 165, weight: 62, bloodGroup: 'A+', expiryDate: new Date('2026-06-01') },
    { user: memberUsers[1]._id, membershipPlan: 'basic',   trainer: trainers[1]._id, status: 'active', height: 175, weight: 80, bloodGroup: 'O+', expiryDate: new Date('2026-04-15') },
    { user: memberUsers[2]._id, membershipPlan: 'premium', trainer: trainers[0]._id, status: 'inactive', height: 158, weight: 55, bloodGroup: 'B+' },
    { user: memberUsers[3]._id, membershipPlan: 'annual',  trainer: trainers[1]._id, status: 'active', height: 180, weight: 85, bloodGroup: 'AB+', expiryDate: new Date('2027-01-01') },
    { user: memberUsers[4]._id, membershipPlan: 'basic',   trainer: trainers[2]._id, status: 'pending', height: 162, weight: 58 },
    { user: memberUsers[5]._id, membershipPlan: 'premium', trainer: trainers[2]._id, status: 'active', height: 172, weight: 78, bloodGroup: 'O-', expiryDate: new Date('2026-05-01') },
  ]);

  // Classes
  const classes = await Class.create([
    { name: 'Morning HIIT',     trainer: trainers[2]._id, category: 'hiit',     schedule: [{ day: 'Monday', startTime: '06:00', endTime: '07:00' }, { day: 'Wednesday', startTime: '06:00', endTime: '07:00' }, { day: 'Friday', startTime: '06:00', endTime: '07:00' }], capacity: 20, level: 'advanced', color: '#ff4d1c', enrolled: [members[0]._id, members[3]._id] },
    { name: 'Power Yoga',       trainer: trainers[1]._id, category: 'yoga',     schedule: [{ day: 'Tuesday', startTime: '08:00', endTime: '09:00' }, { day: 'Thursday', startTime: '08:00', endTime: '09:00' }], capacity: 15, level: 'beginner', color: '#3b82f6', enrolled: [members[1]._id] },
    { name: 'Strength Training',trainer: trainers[0]._id, category: 'strength', schedule: [{ day: 'Monday', startTime: '10:00', endTime: '11:00' }, { day: 'Tuesday', startTime: '10:00', endTime: '11:00' }], capacity: 12, level: 'intermediate', color: '#22c55e', enrolled: [members[5]._id] },
    { name: 'Zumba Dance',      trainer: trainers[3]._id, category: 'zumba',    schedule: [{ day: 'Monday', startTime: '17:00', endTime: '18:00' }, { day: 'Wednesday', startTime: '17:00', endTime: '18:00' }], capacity: 25, level: 'beginner', color: '#f59e0b', enrolled: [members[0]._id, members[2]._id] },
    { name: 'Evening CrossFit', trainer: trainers[2]._id, category: 'crossfit', schedule: [{ day: 'Tuesday', startTime: '19:00', endTime: '20:00' }, { day: 'Thursday', startTime: '19:00', endTime: '20:00' }], capacity: 16, level: 'advanced', color: '#8b5cf6', enrolled: [members[3]._id] },
    { name: 'Pilates Core',     trainer: trainers[1]._id, category: 'pilates',  schedule: [{ day: 'Saturday', startTime: '09:00', endTime: '10:00' }, { day: 'Sunday', startTime: '09:00', endTime: '10:00' }], capacity: 10, level: 'beginner', color: '#ec4899', enrolled: [members[4]._id] },
  ]);

  // Payments
  await Payment.create([
    { member: members[0]._id, amount: 5000, plan: 'premium', status: 'paid',    method: 'card',          paidAt: new Date('2026-03-01'), periodStart: new Date('2026-03-01'), periodEnd: new Date('2026-04-01') },
    { member: members[3]._id, amount: 45000, plan: 'annual', status: 'paid',   method: 'bank_transfer',  paidAt: new Date('2026-02-28'), periodStart: new Date('2026-02-28'), periodEnd: new Date('2027-02-28') },
    { member: members[1]._id, amount: 2500,  plan: 'basic',  status: 'overdue', method: 'card',          dueDate: new Date('2026-02-15') },
    { member: members[4]._id, amount: 2500,  plan: 'basic',  status: 'pending', method: 'jazzcash',      dueDate: new Date('2026-03-20') },
    { member: members[5]._id, amount: 5000,  plan: 'premium',status: 'paid',    method: 'card',          paidAt: new Date('2026-03-05'), periodStart: new Date('2026-03-05'), periodEnd: new Date('2026-04-05') },
    { member: members[2]._id, amount: 5000,  plan: 'premium',status: 'overdue', method: 'card',          dueDate: new Date('2026-01-30') },
  ]);

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('Admin:   admin@fitcore.com   / admin123');
  console.log('Trainer: bilal@fitcore.com   / trainer123');
  console.log('Member:  ayesha@email.com    / member123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
