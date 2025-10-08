const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

// PayFast environment variables
const PF_MERCHANT_ID = process.env.PF_MERCHANT_ID;
const PF_MERCHANT_KEY = process.env.PF_MERCHANT_KEY;
const PF_PASSPHRASE = process.env.PF_PASSPHRASE || '';
const PF_URL = 'https://sandbox.payfast.co.za/eng/process';

// Helper: Generate PayFast signature
function generateSignature(data) {
  const sortedKeys = Object.keys(data).sort();
  const queryString = sortedKeys
    .map(key => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}`)
    .join('&');

  const fullString = PF_PASSPHRASE
    ? `${queryString}&passphrase=${encodeURIComponent(PF_PASSPHRASE)}`
    : queryString;

  return crypto.createHash('md5').update(fullString).digest('hex');
}

// Nodemailer transporter (for Render-safe Gmail SMTP)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,              // TLS port
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password or Gmail API later
  },
});

// PayFast create route
router.post('/create', async (req, res) => {
  try {
    const { amount, item_name, buyer_email } = req.body;

    // Validate input
    if (!amount || !item_name || !buyer_email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // PayFast data payload
    const data = {
      merchant_id: PF_MERCHANT_ID,
      merchant_key: PF_MERCHANT_KEY,
      return_url: 'https://sandbox.payfast.co.za/eng/process/success',
      cancel_url: 'https://sandbox.payfast.co.za/eng/process/cancel',
      notify_url: 'https://sandbox.payfast.co.za/eng/process/notify',
      amount: parseFloat(amount).toFixed(2),
      item_name,
      email_address: buyer_email,
      m_payment_id: 'TEST-' + Date.now(),
    };

    // Generate signature and build redirect URL
    data.signature = generateSignature(data);
    const query = new URLSearchParams(data).toString();
    const paymentUrl = `${PF_URL}?${query}`;

    console.log(`✅ PayFast payment link created: ${paymentUrl}`);

    res.json({
      message: 'PayFast sandbox link generated successfully.',
      url: paymentUrl,
    });
  } catch (err) {
    console.error('❌ PayFast error:', err.message);

    // Attempt to email the error
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: 'Payment processing failed (PayFast)',
        text: `Error: ${err.message}\n\nStack Trace:\n${err.stack}`,
      });
      console.log('📧 Error email sent successfully.');
    } catch (emailErr) {
      console.error('❌ Failed to send error email:', emailErr.message);
    }

    res.status(500).json({ message: 'Payment failed. Error email sent (if possible).' });
  }
});

module.exports = router;
