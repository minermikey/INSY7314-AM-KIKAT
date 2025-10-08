import { useState } from 'react';
import axios from 'axios';

export default function PaymentPage() {
  const [senderEmail, setSenderEmail] = useState('');
  const [receiverEmail, setReceiverEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD'); // default currency
  const [provider, setProvider] = useState('');
  const [accountInfo, setAccountInfo] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [status, setStatus] = useState('');
  const [statusColor, setStatusColor] = useState('');
  const [loading, setLoading] = useState(false); // new loading state

  const currencies = [
    'USD','EUR','GBP','AUD','CAD','ZAR','JPY','CNY','INR','NZD','CHF','SGD','HKD'
  ];

  const submitPayment = async (e) => {
    e.preventDefault();
    setStatus('');
    setStatusColor('');
    setLoading(true); // start loading

    if (!senderEmail || !receiverEmail || !amount || !currency || !provider || !accountInfo || !swiftCode) {
      setStatus('All fields are required.');
      setStatusColor('red');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(senderEmail) || !emailRegex.test(receiverEmail)) {
      setStatus('Please enter valid email addresses.');
      setStatusColor('red');
      setLoading(false);
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
      // Save payment to MongoDB
      await axios.post('https://insy7314-am-kikat.onrender.com/api/payments', payload);

      // Always show clean success message
      setStatus('Payment Successful!');
      setStatusColor('green');

      // Request PayFast sandbox URL
      const payfastRes = await axios.post('https://insy7314-am-kikat.onrender.com/payfast/create', {
        amount,
        item_name: 'CBA Payment',
        senderEmail,
        receiverEmail,
      });

      if (payfastRes.data.url) {
        // Redirect user to PayFast sandbox
        window.location.href = payfastRes.data.url;
      } else {
        setStatus('Failed to generate PayFast link.');
        setStatusColor('red');
      }

      // Reset fields
      setSenderEmail('');
      setReceiverEmail('');
      setAmount('');
      setCurrency('USD');
      setProvider('');
      setAccountInfo('');
      setSwiftCode('');
    } catch (err) {
      console.error(err.response?.data || err.message);
      setStatus('Failed to process payment.');
      setStatusColor('red');
    } finally {
      setLoading(false); // stop loading
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: 32, gap: 24 }}>
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
            onChange={(e) => setSenderEmail(e.target.value)}
          />

          <input
            className="form-control"
            type="email"
            placeholder="Receiver Email"
            value={receiverEmail}
            onChange={(e) => setReceiverEmail(e.target.value)}
          />

          <input
            className="form-control"
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <select
            className="form-control"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {currencies.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <input
            className="form-control"
            placeholder="Provider (SWIFT)"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          />

          <input
            className="form-control"
            placeholder="Account Information"
            value={accountInfo}
            onChange={(e) => setAccountInfo(e.target.value)}
          />

          <input
            className="form-control"
            placeholder="SWIFT Code"
            value={swiftCode}
            onChange={(e) => setSwiftCode(e.target.value)}
          />

          <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
            <button
              className="btn btn-primary btn-lg"
              style={{ flex: 1, fontSize: 18 }}
              type="submit"
              disabled={loading} // disable while processing
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
          </div>

          {status && (
            <div style={{ color: statusColor, fontSize: 16, marginTop: 8 }}>
              {status}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
