// Backend/services/emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App password from Gmail
  },
});

async function sendTransactionEmails(senderEmail, receiverEmail, amount) {
  try {
    const senderMail = {
      from: process.env.EMAIL_USER,
      to: senderEmail,
      subject: 'Payment Sent Confirmation',
      text: `You have successfully sent ${amount} to ${receiverEmail}.`,
    };

    const receiverMail = {
      from: process.env.EMAIL_USER,
      to: receiverEmail,
      subject: 'Payment Received Notification',
      text: `You have received ${amount} from ${senderEmail}.`,
    };

    await transporter.sendMail(senderMail);
    await transporter.sendMail(receiverMail);

    console.log('Emails sent successfully!');
  } catch (error) {
    console.error('Error sending emails:', error);
    throw error; // Let your route handle this
  }
}

module.exports = sendTransactionEmails;
