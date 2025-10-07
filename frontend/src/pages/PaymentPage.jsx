import { useState } from 'react';
import axios from 'axios';

export default function PaymentPage() {
  const [senderEmail, setSenderEmail] = useState('');
  const [receiverEmail, setReceiverEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [provider, setProvider] = useState('');
  const [accountInfo, setAccountInfo] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [status, setStatus] = useState('');

  const submitPayment = async (e) => {
    e.preventDefault();
    setStatus('');

    if (!senderEmail || !receiverEmail || !amount || !currency || !provider || !accountInfo || !swiftCode) {
      setStatus('All fields are required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(senderEmail) || !emailRegex.test(receiverEmail)) {
      setStatus('Please enter valid email addresses.');
      return;
    }

    const payload = {
      amount,
      currency,
      provider,
      accountInfo,
      swiftCode,
      senderEmail,
      receiverEmail
    };

    try {
      const res = await axios.post('http://localhost:5000/api/payments', payload);
      setStatus(res.data.message || 'Payment submitted successfully!');
      setSenderEmail('');
      setReceiverEmail('');
      setAmount('');
      setCurrency('');
      setProvider('');
      setAccountInfo('');
      setSwiftCode('');
    } catch (err) {
      console.error(err);
      setStatus('Failed to process payment.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: 32,
      gap: 24
    }}>
      <div style={{
        width: '100%',
        maxWidth: 900,
        background: 'rgba(255,255,255,0.92)',
        padding: 28,
        borderRadius: 10,
        boxShadow: '0 6px 20px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ margin: 4, fontSize: 26 }}>International Payment</h3>
        <p style={{ marginTop: 8, marginBottom: 18, color: '#555' }}>
          Enter the payment details below to complete your transaction.
        </p>

        <form onSubmit={submitPayment} style={{ display: 'grid', gap: 14, width: '100%' }}>
          <input
            className="form-control"
            type="email"
            placeholder="Sender Email"
            value={senderEmail}
            onChange={e => setSenderEmail(e.target.value)}
          />

          <input
            className="form-control"
            type="email"
            placeholder="Receiver Email"
            value={receiverEmail}
            onChange={e => setReceiverEmail(e.target.value)}
          />

          <input
            className="form-control"
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />

          <input
            className="form-control"
            placeholder="Currency (e.g. USD, EUR)"
            value={currency}
            onChange={e => setCurrency(e.target.value)}
          />

          <input
            className="form-control"
            placeholder="Provider (SWIFT)"
            value={provider}
            onChange={e => setProvider(e.target.value)}
          />

          <input
            className="form-control"
            placeholder="Account Information"
            value={accountInfo}
            onChange={e => setAccountInfo(e.target.value)}
          />

          <input
            className="form-control"
            placeholder="SWIFT Code"
            value={swiftCode}
            onChange={e => setSwiftCode(e.target.value)}
          />

          <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
            <button className="btn btn-primary btn-lg" style={{ flex: 1, fontSize: 18 }} type="submit">
              Pay Now
            </button>
          </div>

          {status && (
            <div style={{
              color: status.toLowerCase().includes('success') ? 'green' : 'red',
              fontSize: 16,
              marginTop: 8
            }}>
              {status}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
