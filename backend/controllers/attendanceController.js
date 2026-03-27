const Attendance = require('../models/Attendance');
const Member = require('../models/Member');

// @GET /api/attendance
exports.getAttendance = async (req, res) => {
  try {
    const { date, memberId, classId } = req.query;
    let query = {};
    if (memberId) query.member = memberId;
    if (classId) query.class = classId;
    if (date) {
      const d = new Date(date);
      query.date = { $gte: new Date(d.setHours(0,0,0,0)), $lt: new Date(d.setHours(23,59,59,999)) };
    }

    const records = await Attendance.find(query)
      .populate({ path: 'member', populate: { path: 'user', select: 'name email avatar' } })
      .populate('class', 'name')
      .sort({ date: -1 });

    res.json({ success: true, count: records.length, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/attendance/checkin - Manual
exports.checkIn = async (req, res) => {
  try {
    const { memberId, classId } = req.body;
    const today = new Date();
    const start = new Date(today.setHours(0,0,0,0));
    const end   = new Date(today.setHours(23,59,59,999));

    const exists = await Attendance.findOne({ member: memberId, class: classId, date: { $gte: start, $lt: end } });
    if (exists) return res.status(400).json({ success: false, message: 'Already checked in today' });

    const now = new Date();
    const attendance = await Attendance.create({
      member: memberId, class: classId,
      checkIn: now, status: 'present', method: 'manual', markedBy: req.user._id,
    });

    res.status(201).json({ success: true, attendance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/attendance/qr-checkin
exports.qrCheckIn = async (req, res) => {
  try {
    const { qrData, classId } = req.body;
    const member = await Member.findOne({ qrCode: { $regex: qrData } });
    if (!member) return res.status(404).json({ success: false, message: 'Invalid QR Code' });

    const today = new Date();
    const start = new Date(today.setHours(0,0,0,0));
    const end   = new Date(today.setHours(23,59,59,999));

    const exists = await Attendance.findOne({ member: member._id, date: { $gte: start, $lt: end } });
    if (exists) return res.status(400).json({ success: false, message: 'Already checked in' });

    const attendance = await Attendance.create({
      member: member._id, class: classId,
      checkIn: new Date(), status: 'present', method: 'qr',
    });

    res.status(201).json({ success: true, message: 'QR Check-in successful!', attendance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/attendance/stats/:memberId
exports.getMemberStats = async (req, res) => {
  try {
    const { memberId } = req.params;
    const total = await Attendance.countDocuments({ member: memberId });
    const present = await Attendance.countDocuments({ member: memberId, status: 'present' });
    const absent = await Attendance.countDocuments({ member: memberId, status: 'absent' });
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    res.json({ success: true, stats: { total, present, absent, percentage } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
