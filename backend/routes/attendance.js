const express = require('express');
const router = express.Router();
const { getAttendance, checkIn, qrCheckIn, getMemberStats } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/',                      authorize('admin', 'trainer'), getAttendance);
router.post('/checkin',              authorize('admin', 'trainer'), checkIn);
router.post('/qr-checkin',           qrCheckIn);
router.get('/stats/:memberId',       getMemberStats);

module.exports = router;
