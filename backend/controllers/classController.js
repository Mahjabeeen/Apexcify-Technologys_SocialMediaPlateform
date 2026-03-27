const Class = require('../models/Class');
const Member = require('../models/Member');

exports.getClasses = async (req, res) => {
  try {
    const classes = await Class.find({ isActive: true })
      .populate({ path: 'trainer', populate: { path: 'user', select: 'name' } })
      .populate('enrolled', 'user');
    res.json({ success: true, classes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getClass = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id)
      .populate({ path: 'trainer', populate: { path: 'user', select: 'name email' } })
      .populate({ path: 'enrolled', populate: { path: 'user', select: 'name avatar' } });
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, class: cls });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createClass = async (req, res) => {
  try {
    const cls = await Class.create(req.body);
    res.status(201).json({ success: true, class: cls });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const cls = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, class: cls });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Class deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.enrollMember = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    if (cls.enrolled.length >= cls.capacity) return res.status(400).json({ success: false, message: 'Class is full' });

    const member = await Member.findOne({ user: req.user._id });
    if (!member) return res.status(404).json({ success: false, message: 'Member profile not found' });

    if (cls.enrolled.includes(member._id)) return res.status(400).json({ success: false, message: 'Already enrolled' });
    cls.enrolled.push(member._id);
    await cls.save();
    res.json({ success: true, message: 'Enrolled successfully!', class: cls });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.unenrollMember = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    const member = await Member.findOne({ user: req.user._id });
    cls.enrolled = cls.enrolled.filter(id => id.toString() !== member._id.toString());
    await cls.save();
    res.json({ success: true, message: 'Unenrolled successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
