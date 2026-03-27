const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  member:        { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  amount:        { type: Number, required: true },
  currency:      { type: String, default: 'PKR' },
  plan:          { type: String, enum: ['basic', 'premium', 'annual'], required: true },
  status:        { type: String, enum: ['pending', 'paid', 'failed', 'overdue', 'refunded'], default: 'pending' },
  method:        { type: String, enum: ['card', 'bank_transfer', 'jazzcash', 'easypaisa', 'cash', 'stripe'], default: 'cash' },
  stripePaymentIntentId: { type: String },
  stripeSessionId:       { type: String },
  invoiceNumber: { type: String, unique: true },
  dueDate:       { type: Date },
  paidAt:        { type: Date },
  periodStart:   { type: Date },
  periodEnd:     { type: Date },
  notes:         { type: String },
}, { timestamps: true });

// Auto invoice number
paymentSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Payment').countDocuments();
    this.invoiceNumber = `INV-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
