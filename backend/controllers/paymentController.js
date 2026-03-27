const Payment = require('../models/Payment');
const Member = require('../models/Member');
const { sendEmail } = require('../utils/email');
const { sendSMS } = require('../utils/sms');

const PLAN_PRICES = { basic: 2500, premium: 5000, annual: 45000 };

// @GET /api/payments
exports.getPayments = async (req, res) => {
  try {
    const { status, memberId, page = 1, limit = 20 } = req.query;
    let query = {};
    if (status) query.status = status;
    if (memberId) query.member = memberId;

    const payments = await Payment.find(query)
      .populate({ path: 'member', populate: { path: 'user', select: 'name email phone' } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(Number(limit));

    const total = await Payment.countDocuments(query);
    const revenue = await Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({ success: true, payments, total, revenue: revenue[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/payments/create
exports.createPayment = async (req, res) => {
  try {
    const { memberId, plan, method, notes } = req.body;
    const amount = PLAN_PRICES[plan] || 2500;
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + (plan === 'annual' ? 12 : 1));

    const payment = await Payment.create({
      member: memberId, amount, plan, method: method || 'cash',
      status: 'pending', dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      periodStart: now, periodEnd, notes,
    });

    res.status(201).json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/payments/:id/mark-paid
exports.markPaid = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: 'paid', paidAt: new Date() },
      { new: true }
    ).populate({ path: 'member', populate: { path: 'user', select: 'name email phone' } });

    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    // Update member status
    await Member.findByIdAndUpdate(payment.member._id, { status: 'active', membershipPlan: payment.plan, expiryDate: payment.periodEnd });

    // Send confirmation
    if (payment.member?.user?.email) {
      await sendEmail({
        to: payment.member.user.email,
        subject: `Payment Confirmed - ${payment.invoiceNumber} ✅`,
        template: 'payment',
        data: { name: payment.member.user.name, amount: payment.amount, plan: payment.plan, invoice: payment.invoiceNumber },
      });
    }
    if (payment.member?.user?.phone) {
      await sendSMS({ to: payment.member.user.phone, message: `FitCore: Payment of PKR ${payment.amount} confirmed! Invoice: ${payment.invoiceNumber}` });
    }

    res.json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/payments/stripe-session
exports.createStripeSession = async (req, res) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const { memberId, plan } = req.body;
    const amount = PLAN_PRICES[plan] || 2500;
    const member = await Member.findById(memberId).populate('user', 'name email');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: member.user.email,
      line_items: [{ price_data: { currency: 'pkr', product_data: { name: `FitCore ${plan} Plan` }, unit_amount: amount * 100 }, quantity: 1 }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      metadata: { memberId: memberId.toString(), plan },
    });

    // Save pending payment
    await Payment.create({ member: memberId, amount, plan, method: 'stripe', status: 'pending', stripeSessionId: session.id });

    res.json({ success: true, url: session.url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/payments/stats
exports.getStats = async (req, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthly = await Payment.aggregate([
      { $match: { status: 'paid', paidAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);
    const overdue = await Payment.countDocuments({ status: 'overdue' });
    const pending = await Payment.countDocuments({ status: 'pending' });
    res.json({ success: true, stats: { monthlyRevenue: monthly[0]?.total || 0, monthlyCount: monthly[0]?.count || 0, overdue, pending } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
