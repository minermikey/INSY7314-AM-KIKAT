// Backend/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const sendTransactionEmails = require('../services/emailService');

router.post('/', async (req, res) => {
  try {
    const {
      username,
      accountNumber,
      amount,
      currency,
      provider,
      accountInfo,
      swiftCode,
      senderEmail,
      receiverEmail,
    } = req.body;

    // Basic validation
    if (![amount, currency, provider, accountInfo, swiftCode, senderEmail, receiverEmail].every(Boolean)) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create new payment
    const payment = new Payment({
      username: username || 'Test User',
      accountNumber: accountNumber || '12345678',
      amount,
      currency,
      provider,
      accountInfo,
      swiftCode,
      senderEmail,
      receiverEmail,
    });

    // Save to DB
    await payment.save();

    // Send test emails (logs only)
    await sendTransactionEmails(senderEmail, receiverEmail, `${currency} ${amount}`);

    res.status(200).json({ message: 'Payment processed (TEST MODE). Emails logged to console.' });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ message: 'Failed to process payment (TEST MODE).' });
  }
});

module.exports = router;
