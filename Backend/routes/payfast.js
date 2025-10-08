const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

const PF_MERCHANT_ID = process.env.PF_MERCHANT_ID;
const PF_MERCHANT_KEY = process.env.PF_MERCHANT_KEY;
const PF_PASSPHRASE = process.env.PF_PASSPHRASE || '';
const PF_URL = 'https://sandbox.payfast.co.za/eng/process';

// ✅ Generate PayFast signature (strictly correct format)
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

// ✅ Handle payment creation
router.post('/create', async (req, res) => {
  console.log('💡 Incoming payment request:', req.body);

  try {
    const { amount, currency, senderEmail, receiverEmail, provider, accountInfo, swiftCode } = req.body;

    if (!amount || !senderEmail || !receiverEmail) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const item_name = `Payment via ${provider || 'Bank Transfer'}`;
    const data = {
      merchant_id: PF_MERCHANT_ID,
      merchant_key: PF_MERCHANT_KEY,
      return_url: 'https://yourapp.onrender.com/success',
      cancel_url: 'https://yourapp.onrender.com/cancel',
      notify_url: 'https://yourapp.onrender.com/notify',
      amount: parseFloat(amount).toFixed(2),
      item_name,
      email_address: senderEmail,
      m_payment_id: 'PAY-' + Date.now(),
    };

    data.signature = generateSignature(data);
    const pfUrl = PF_URL + '?' + Object.entries(data)
      .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
      .join('&');

    console.log('✅ Generated PayFast URL:', pfUrl);

    // ✅ Optional email confirmations
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: senderEmail,
      subject: 'Payment Initiated',
      text: `You have sent ${currency || 'ZAR'} ${amount} to ${receiverEmail}.`,
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: receiverEmail,
      subject: 'Payment Received',
      text: `You are receiving ${currency || 'ZAR'} ${amount} from ${senderEmail}.`,
    });

    return res.json({
      message: '✅ PayFast sandbox link generated successfully.',
      url: pfUrl,
    });

  } catch (err) {
    console.error('❌ Payment creation failed:');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);

    res.status(500).json({
      message: 'Failed to process payment.',
      error: err.message,
    });
  }
});

module.exports = router;
