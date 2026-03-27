const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const templates = {
  welcome: (data) => ({
    subject: `Welcome to FitCore, ${data.name}! 🔥`,
    html: `<div style="font-family:sans-serif;max-width:500px;margin:auto;background:#111;color:#fff;border-radius:12px;overflow:hidden">
      <div style="background:#ff4d1c;padding:24px;text-align:center">
        <h1 style="font-size:2rem;letter-spacing:2px;margin:0">🔥 FITCORE</h1>
      </div>
      <div style="padding:28px">
        <h2>Welcome, ${data.name}!</h2>
        <p style="color:#aaa">Your FitCore membership is now active. Start your fitness journey today!</p>
        <div style="margin-top:20px;padding:16px;background:#1a1a1a;border-radius:8px;border-left:3px solid #ff4d1c">
          <p style="margin:0;color:#ccc">Login to your dashboard to explore classes, workouts, and more.</p>
        </div>
      </div>
    </div>`
  }),
  payment: (data) => ({
    subject: `Payment Confirmed - ${data.invoice} ✅`,
    html: `<div style="font-family:sans-serif;max-width:500px;margin:auto;background:#111;color:#fff;border-radius:12px;overflow:hidden">
      <div style="background:#22c55e;padding:20px;text-align:center">
        <h2 style="margin:0">✅ Payment Confirmed</h2>
      </div>
      <div style="padding:28px">
        <p>Hi ${data.name},</p>
        <p style="color:#aaa">Your payment has been received successfully.</p>
        <table style="width:100%;margin-top:16px;border-collapse:collapse">
          <tr><td style="padding:8px;color:#aaa">Invoice</td><td style="padding:8px;font-weight:bold">${data.invoice}</td></tr>
          <tr><td style="padding:8px;color:#aaa">Plan</td><td style="padding:8px;text-transform:capitalize">${data.plan}</td></tr>
          <tr><td style="padding:8px;color:#aaa">Amount</td><td style="padding:8px;font-weight:bold;color:#22c55e">PKR ${data.amount?.toLocaleString()}</td></tr>
        </table>
      </div>
    </div>`
  }),
  overdue: (data) => ({
    subject: `Payment Reminder - FitCore ⚠️`,
    html: `<div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px">
      <h2>Payment Reminder</h2>
      <p>Hi ${data.name}, your payment of PKR ${data.amount} is overdue. Please pay to continue your membership.</p>
    </div>`
  }),
};

exports.sendEmail = async ({ to, subject, template, data, html }) => {
  try {
    const t = template ? templates[template](data) : { subject, html };
    await transporter.sendMail({ from: `"FitCore" <${process.env.EMAIL_USER}>`, to, subject: t.subject, html: t.html });
    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error('Email error:', err.message);
  }
};
