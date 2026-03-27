const Trainer = require('../models/Trainer');
const User = require('../models/User');

exports.getTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find()
      .populate('user', 'name email phone avatar')
      .populate('members');
    res.json({ success: true, trainers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id)
      .populate('user', 'name email phone avatar')
      .populate({ path: 'members', populate: { path: 'user', select: 'name avatar' } });
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });
    res.json({ success: true, trainer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createTrainer = async (req, res) => {
  try {
    const { name, email, password, phone, specialty, experience, bio, salary } = req.body;
    const user = await User.create({ name, email, password: password || 'trainer123', phone, role: 'trainer' });
    const trainer = await Trainer.create({ user: user._id, specialty, experience, bio, salary });
    res.status(201).json({ success: true, trainer: await trainer.populate('user', '-password') });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('user', '-password');
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });
    res.json({ success: true, trainer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.rateTrainer = async (req, res) => {
  try {
    const { rating } = req.body;
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });
    const newTotal = trainer.totalRatings + 1;
    const newRating = ((trainer.rating * trainer.totalRatings) + rating) / newTotal;
    trainer.rating = Math.round(newRating * 10) / 10;
    trainer.totalRatings = newTotal;
    await trainer.save();
    res.json({ success: true, trainer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
