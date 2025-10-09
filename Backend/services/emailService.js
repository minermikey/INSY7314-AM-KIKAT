// emailService.js
import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends transaction emails to both sender and receiver.
 * @param {string} senderEmail - Sender's email address
 * @param {string} receiverEmail - Receiver's email address
 * @param {number|string} amount - Transaction amount
 */
export async function sendTransactionEmails(senderEmail, receiverEmail, amount) {
  try {
    // Email to sender
    const senderMail = {
      from: 'onboarding@resend.dev', // Default sender for testing
      to: senderEmail,
      subject: 'Payment Sent Confirmation',
      html: `<p>You have successfully sent <strong>${amount}</strong> to <strong>${receiverEmail}</strong>.</p>`,
    };

    // Email to receiver
    const receiverMail = {
      from: 'onboarding@resend.dev',
      to: receiverEmail,
      subject: 'Payment Received Notification',
      html: `<p>You have received <strong>${amount}</strong> from <strong>${senderEmail}</strong>.</p>`,
    };

    // Send both emails
    await resend.emails.send(senderMail);
    await resend.emails.send(receiverMail);

    console.log('✅ Transaction emails sent successfully!');
  } catch (error) {
    console.error('❌ Error sending transaction emails:', error);
    throw error; // Let your route handle this
  }
}
