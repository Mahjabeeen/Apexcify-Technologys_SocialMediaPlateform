const Member = require('../models/Member');
const Trainer = require('../models/Trainer');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');

exports.getStats = async (req, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const todayStart = new Date(now.setHours(0,0,0,0));

    const [totalMembers, activeMembers, totalTrainers, totalClasses,
           todayAttendance, monthlyRevenue, overduePayments, newMembersThisMonth] = await Promise.all([
      Member.countDocuments(),
      Member.countDocuments({ status: 'active' }),
      Trainer.countDocuments({ status: 'active' }),
      Class.countDocuments({ isActive: true }),
      Attendance.countDocuments({ date: { $gte: todayStart }, status: 'present' }),
      Payment.aggregate([{ $match: { status: 'paid', paidAt: { $gte: monthStart } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Payment.countDocuments({ status: 'overdue' }),
      Member.countDocuments({ createdAt: { $gte: monthStart } }),
    ]);

    res.json({
      success: true,
      stats: {
        totalMembers, activeMembers, totalTrainers, totalClasses,
        todayAttendance, monthlyRevenue: monthlyRevenue[0]?.total || 0,
        overduePayments, newMembersThisMonth,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const recentMembers = await Member.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email');
    const recentPayments = await Payment.find().sort({ createdAt: -1 }).limit(5).populate({ path: 'member', populate: { path: 'user', select: 'name' } });
    const recentAttendance = await Attendance.find().sort({ date: -1 }).limit(10).populate({ path: 'member', populate: { path: 'user', select: 'name' } }).populate('class', 'name');
    res.json({ success: true, recentMembers, recentPayments, recentAttendance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
