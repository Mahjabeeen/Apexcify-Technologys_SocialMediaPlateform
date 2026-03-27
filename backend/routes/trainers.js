const express = require('express');
const router = express.Router();
const { getTrainers, getTrainer, createTrainer, updateTrainer, rateTrainer } = require('../controllers/trainerController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/',          getTrainers);
router.post('/',         authorize('admin'), createTrainer);
router.get('/:id',       getTrainer);
router.put('/:id',       authorize('admin'), updateTrainer);
router.post('/:id/rate', authorize('member'), rateTrainer);

module.exports = router;
