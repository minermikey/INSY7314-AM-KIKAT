require('dotenv').config();
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// PayFast credentials
const PF_MERCHANT_ID = process.env.PF_MERCHANT_ID;
const PF_MERCHANT_KEY = process.env.PF_MERCHANT_KEY;
const PF_PASSPHRASE = process.env.PF_PASSPHRASE || '';
const PF_URL = 'https://sandbox.payfast.co.za/eng/process';

// Nodemailer setup using Gmail App Password
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

// Generate PayFast signature
function generateSignature(data) {
  const sortedKeys = Object.keys(data).sort();
  const queryString = sortedKeys
    .map((key) => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}`)
    .join('&');

  return PF_PASSPHRASE
    ? crypto.createHash('md5').update(`${queryString}&passphrase=${encodeURIComponent(PF_PASSPHRASE)}`).digest('hex')
    : crypto.createHash('md5').update(queryString).digest('hex');
}

// Create payment and send emails
router.post('/create', async (req, res) => {
  try {
    console.log('💡 Incoming payment request:', req.body);

    const { amount, item_name, senderEmail, receiverEmail } = req.body;

    // Validation
    if (!amount || !item_name || !senderEmail || !receiverEmail) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // PayFast data
    const data = {
      merchant_id: PF_MERCHANT_ID,
      merchant_key: PF_MERCHANT_KEY,
      return_url: 'https://your-render-app.onrender.com/success',
      cancel_url: 'https://your-render-app.onrender.com/cancel',
      notify_url: 'https://your-render-app.onrender.com/notify',
      amount: parseFloat(amount).toFixed(2),
      item_name,
      email_address: senderEmail,
      m_payment_id: 'PAY-' + Date.now(),
    };

    data.signature = generateSignature(data);

    const pfUrl =
      PF_URL + '?' + Object.entries(data).map(([k,v]) => `${k}=${encodeURIComponent(v)}`).join('&');

    // Send emails
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: senderEmail,
      subject: 'Payment Confirmation',
      text: `You have sent ZAR ${amount} to ${receiverEmail}.`,
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: receiverEmail,
      subject: 'Payment Received',
      text: `You have received ZAR ${amount} from ${senderEmail}.`,
    });

    // Return PayFast URL to frontend
    res.json({ url: pfUrl });

  } catch (err) {
    console.error('💥 Payment route error:', err.stack || err);
    res.status(500).json({ 
      message: 'Failed to process payment.', 
      error: err.toString(),
      stack: err.stack
    });
  }
});

module.exports = router;
