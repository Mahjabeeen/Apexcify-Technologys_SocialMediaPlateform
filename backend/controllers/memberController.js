const Member = require('../models/Member');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

// @GET /api/members
exports.getMembers = async (req, res) => {
  try {
    const { status, plan, trainer, search, page = 1, limit = 20 } = req.query;
    let query = {};
    if (status) query.status = status;
    if (plan) query.membershipPlan = plan;
    if (trainer) query.trainer = trainer;

    let members = await Member.find(query)
      .populate('user', 'name email phone avatar createdAt')
      .populate('trainer', 'user')
      .populate({ path: 'trainer', populate: { path: 'user', select: 'name' } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    if (search) {
      members = members.filter(m =>
        m.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        m.user?.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = await Member.countDocuments(query);
    res.json({ success: true, count: members.length, total, members });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/members/:id
exports.getMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id)
      .populate('user', '-password')
      .populate({ path: 'trainer', populate: { path: 'user', select: 'name email' } });
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

    const attendanceCount = await Attendance.countDocuments({ member: member._id, status: 'present' });
    res.json({ success: true, member, attendanceCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/members
exports.createMember = async (req, res) => {
  try {
    const { name, email, password, phone, plan, trainerId, height, weight, bloodGroup, goals } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'Email already exists' });

    const user = await User.create({ name, email, password: password || 'fitcore123', phone, role: 'member' });

    // Generate QR
    const qrData = uuidv4();
    const qrCode = await QRCode.toDataURL(qrData);

    const member = await Member.create({
      user: user._id, membershipPlan: plan || 'basic',
      trainer: trainerId || null, height, weight, bloodGroup,
      goals: goals || [], qrCode, status: 'active',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json({ success: true, member: await member.populate('user', '-password') });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/members/:id
exports.updateMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('user', '-password');
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, member });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/members/:id
exports.deleteMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    await User.findByIdAndDelete(member.user);
    await member.deleteOne();
    res.json({ success: true, message: 'Member deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/members/:id/qr
exports.getMemberQR = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    if (!member.qrCode) {
      const qrData = uuidv4();
      member.qrCode = await QRCode.toDataURL(qrData);
      await member.save();
    }
    res.json({ success: true, qrCode: member.qrCode });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
