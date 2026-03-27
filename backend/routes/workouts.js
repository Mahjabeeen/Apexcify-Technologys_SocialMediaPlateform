const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { WorkoutPlan, DietPlan } = require('../models/WorkoutPlan');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.use(protect);

// Workout Plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await WorkoutPlan.find()
      .populate({ path: 'trainer', populate: { path: 'user', select: 'name' } });
    res.json({ success: true, plans });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/plans', authorize('admin', 'trainer'), upload.single('file'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.file = req.file.path;
    if (typeof data.exercises === 'string') data.exercises = JSON.parse(data.exercises);
    const plan = await WorkoutPlan.create(data);
    res.status(201).json({ success: true, plan });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/plans/:id/assign', authorize('admin', 'trainer'), async (req, res) => {
  try {
    const plan = await WorkoutPlan.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { assignedTo: req.body.memberId } },
      { new: true }
    );
    res.json({ success: true, plan });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Diet Plans
router.get('/diet', async (req, res) => {
  try {
    const plans = await DietPlan.find()
      .populate({ path: 'trainer', populate: { path: 'user', select: 'name' } });
    res.json({ success: true, plans });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/diet', authorize('admin', 'trainer'), upload.single('file'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.file = req.file.path;
    if (typeof data.meals === 'string') data.meals = JSON.parse(data.meals);
    const plan = await DietPlan.create(data);
    res.status(201).json({ success: true, plan });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
