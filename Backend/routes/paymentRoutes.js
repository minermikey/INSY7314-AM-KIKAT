require('dotenv').config();
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// === CONFIG VARIABLES ===
const PF_MERCHANT_ID = process.env.PF_MERCHANT_ID;
const PF_MERCHANT_KEY = process.env.PF_MERCHANT_KEY;
const PF_PASSPHRASE = process.env.PF_PASSPHRASE || '';
const PF_URL = 'https://sandbox.payfast.co.za/eng/process';

console.log('✅ PayFast Config Loaded:', {
  PF_MERCHANT_ID,
  PF_MERCHANT_KEY,
  PF_PASSPHRASE: PF_PASSPHRASE ? 'SET' : 'NOT SET',
  PF_URL
});

// === SETUP NODEMAILER ===
let transporter;
try {
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  console.log('✅ Email transporter configured');
} catch (err) {
  console.error('❌ Failed to configure email transporter:', err);
}

// === HELPER: Generate PayFast signature ===
function generateSignature(data) {
  try {
    const sortedKeys = Object.keys(data).sort();
    const queryString = sortedKeys
      .map((key) => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}`)
      .join('&');

    const fullString = PF_PASSPHRASE
      ? `${queryString}&passphrase=${encodeURIComponent(PF_PASSPHRASE)}`
      : queryString;

    const signature = crypto.createHash('md5').update(fullString).digest('hex');
    console.log('🧾 Generated signature:', signature);
    return signature;
  } catch (err) {
    console.error('❌ Error generating signature:', err);
    throw err;
  }
}

// === MAIN PAYMENT ROUTE ===
router.post('/create', async (req, res) => {
  console.log('\n💡 Incoming payment request:', req.body);

  try {
    // STEP 1: Validate input
    const { amount, item_name, senderEmail, receiverEmail } = req.body;
    if (!amount || !item_name || !senderEmail || !receiverEmail) {
      console.warn('⚠️ Validation failed: Missing required fields');
      return res.status(400).json({ message: 'Missing required fields', body: req.body });
    }

    console.log('✅ Step 1 complete: Input validated.');

    // STEP 2: Prepare PayFast data
    const data = {
      merchant_id: PF_MERCHANT_ID,
      merchant_key: PF_MERCHANT_KEY,
      return_url: 'https://insy7314-am-kikat.onrender.com/success',
      cancel_url: 'https://insy7314-am-kikat.onrender.com/cancel',
      notify_url: 'https://insy7314-am-kikat.onrender.com/notify',
      amount: parseFloat(amount).toFixed(2),
      item_name,
      email_address: senderEmail,
      m_payment_id: 'PAY-' + Date.now(),
    };

    console.log('🧩 Step 2: PayFast Data:', data);

    // STEP 3: Generate signature
    data.signature = generateSignature(data);
    console.log('✅ Step 3 complete: Signature attached.');

    // STEP 4: Construct redirect URL
    const pfUrl =
      PF_URL + '?' + Object.entries(data).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
    console.log('🔗 Step 4 complete: PayFast URL generated:', pfUrl);

    // STEP 5: Send emails
    try {
      console.log('📧 Step 5: Sending emails...');
      const senderMail = {
        from: process.env.EMAIL_USER,
        to: senderEmail,
        subject: 'Payment Sent Confirmation',
        text: `You have successfully sent ZAR ${amount} to ${receiverEmail}.`,
      };

      const receiverMail = {
        from: process.env.EMAIL_USER,
        to: receiverEmail,
        subject: 'Payment Received Notification',
        text: `You have received ZAR ${amount} from ${senderEmail}.`,
      };

      await transporter.sendMail(senderMail);
      console.log('✅ Email sent to sender:', senderEmail);

      await transporter.sendMail(receiverMail);
      console.log('✅ Email sent to receiver:', receiverEmail);
    } catch (emailErr) {
      console.error('❌ Email sending error:', emailErr);
      return res.status(500).json({
        message: 'Payment created, but email sending failed.',
        emailError: emailErr.message,
      });
    }

    // STEP 6: Respond success
    console.log('🎉 Step 6 complete: Payment flow successful.');
    res.json({
      message: 'Payment created successfully!',
      payfast_url: pfUrl,
      debug_data: data,
    });
  } catch (err) {
    console.error('💀 FULL ERROR (Catch-All):', err);
    res.status(500).json({
      message: 'Failed to process payment.',
      error: err.message,
      stack: err.stack,
      body: req.body,
    });
  }
});

module.exports = router;
