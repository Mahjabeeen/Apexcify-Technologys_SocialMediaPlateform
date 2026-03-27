const express = require('express');
const router = express.Router();
const { getStats, getRecentActivity } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/stats',    authorize('admin', 'trainer'), getStats);
router.get('/activity', authorize('admin', 'trainer'), getRecentActivity);

module.exports = router;
