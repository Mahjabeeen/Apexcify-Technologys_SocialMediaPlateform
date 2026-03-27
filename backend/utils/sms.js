exports.sendSMS = async ({ to, message }) => {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.log(`📱 SMS (mock): To ${to} — ${message}`);
      return;
    }
    const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await twilio.messages.create({ body: message, from: process.env.TWILIO_PHONE, to });
    console.log(`📱 SMS sent to ${to}`);
  } catch (err) {
    console.error('SMS error:', err.message);
  }
};
