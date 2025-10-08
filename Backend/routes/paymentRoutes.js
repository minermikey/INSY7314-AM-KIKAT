const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Payment = require('../models/Payment');
require('dotenv').config();

const PF_MERCHANT_ID = process.env.PF_MERCHANT_ID;
const PF_MERCHANT_KEY = process.env.PF_MERCHANT_KEY;
const PF_PASSPHRASE = process.env.PF_PASSPHRASE || '';
const PF_URL = 'https://sandbox.payfast.co.za/eng/process';

// Correct signature generation
function generateSignature(data) {
  const sortedKeys = Object.keys(data).sort();
  const queryString = sortedKeys
    .map((key) => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}`)
    .join('&');
  const fullString = PF_PASSPHRASE
    ? `${queryString}&passphrase=${encodeURIComponent(PF_PASSPHRASE)}`
    : queryString;
  return crypto.createHash('md5').update(fullString).digest('hex');
}

// POST /api/payments/create
router.post('/create', async (req, res) => {
  console.log('💡 Incoming payment request:', req.body);
  try {
    const { amount, currency, provider, accountInfo, swiftCode, senderEmail, receiverEmail } = req.body;

    // Validation
    if (!amount || !currency || !provider || !accountInfo || !swiftCode || !senderEmail || !receiverEmail) {
      console.warn('⚠️ Validation failed: Missing required fields');
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Save payment in MongoDB
    const payment = new Payment({
      amount,
      currency,
      provider,
      accountInfo,
      swiftCode,
      senderEmail,
      receiverEmail,
    });
    await payment.save();

    // PayFast data
    const data = {
      merchant_id: PF_MERCHANT_ID,
      merchant_key: PF_MERCHANT_KEY,
      return_url: 'https://insy7314-am-kikat.onrender.com/success',
      cancel_url: 'https://insy7314-am-kikat.onrender.com/cancel',
      notify_url: 'https://insy7314-am-kikat.onrender.com/notify',
      amount: parseFloat(amount).toFixed(2),
      item_name: `Transfer from ${senderEmail}`,
      email_address: senderEmail,
      m_payment_id: 'PAY-' + Date.now(),
    };

    data.signature = generateSignature(data);

    const pfUrl =
      PF_URL + '?' + Object.entries(data).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');

    // Send emails (with error capture)
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: senderEmail,
        subject: 'Payment Sent',
        text: `You have sent ZAR ${amount} to ${receiverEmail}.`,
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: receiverEmail,
        subject: 'Payment Received',
        text: `You have received ZAR ${amount} from ${senderEmail}.`,
      });

      console.log('📧 Emails sent successfully!');
    } catch (mailErr) {
      console.error('📮 Email error:', mailErr);
    }

    res.json({ message: 'Payment processed successfully', url: pfUrl });
  } catch (err) {
    console.error('💥 Full payment error:', err);
    res.status(500).json({ message: 'Failed to process payment', error: err.message });
  }
});

module.exports = router;
