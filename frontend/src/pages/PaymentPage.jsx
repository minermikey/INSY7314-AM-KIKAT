import React, { useState } from 'react';
import axios from 'axios';

const PaymentPage = () => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!recipient || !amount) {
      alert('Please fill all fields.');
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Check whitelist
      const whitelistResult = await axios.post('http://localhost:3000/api/check-whitelist', { recipient });

      if (!whitelistResult.data.isWhitelisted) {
        setLoading(false);
        alert('Recipient is not whitelisted.');
        return;
      }

      // 2️⃣ Process payment
      const paymentResult = await axios.post('http://localhost:3000/api/process-payment', { recipient, amount });

      setLoading(false);

      if (paymentResult.data.success) {
        alert(`Payment of ${amount} to ${recipient} completed.`);
        setRecipient('');
        setAmount('');
      } else {
        alert(paymentResult.data.message || 'Payment failed.');
      }
    } catch (error) {
      setLoading(false);
      alert('Something went wrong. Please try again.');
      console.error(error);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Send Payment</h1>
      <input
        type="text"
        placeholder="Recipient Account"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        style={styles.input}
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={styles.input}
      />
      <button onClick={handlePayment} disabled={loading} style={styles.button}>
        {loading ? 'Processing...' : 'Send Payment'}
      </button>
    </div>
  );
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20 },
  input: { padding: 12, marginBottom: 15, width: 300, fontSize: 16 },
  button: { padding: 15, width: 300, backgroundColor: '#2196F3', color: 'white', fontSize: 16, cursor: 'pointer' },
};

export default PaymentPage;
