const express = require('express');
const router = express.Router();
const { getPayments, createPayment, markPaid, createStripeSession, getStats } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/',                      authorize('admin'), getPayments);
router.get('/stats',                 authorize('admin'), getStats);
router.post('/',                     authorize('admin'), createPayment);
router.put('/:id/mark-paid',         authorize('admin'), markPaid);
router.post('/stripe-session',       createStripeSession);

module.exports = router;
