// ...new file (replace existing PaymentSuccess.jsx)...
import { useLocation, useNavigate } from 'react-router-dom';

export default function PaymentSuccess() {
  const { state } = useLocation();
  const nav = useNavigate();

  const payment = state || null;

  return (
    <div style={{ padding: 40, maxWidth: 900, margin: '0 auto' }}>
      <h1>✅ Payment Successful!</h1>
      <p>Thank you — your payment was processed successfully.</p>

      {!payment ? (
        <div style={{ marginTop: 20 }}>
          <p>No payment details available.</p>
          <button className="btn btn-primary" onClick={() => nav('/')}>Return home</button>
        </div>
      ) : (
        <div style={{ marginTop: 20, background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
          <h4 style={{ marginTop: 0 }}>Payment summary</h4>
          <dl style={{ display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 8, columnGap: 12 }}>
            <dt>Amount</dt><dd>{payment.currency} {payment.amount}</dd>
            <dt>Provider</dt><dd>{payment.provider}</dd>
            <dt>Account info</dt><dd style={{ wordBreak: 'break-word' }}>{payment.accountInfo}</dd>
            <dt>SWIFT</dt><dd>{payment.swiftCode}</dd>
            <dt>Sender</dt><dd>{payment.senderEmail}</dd>
            <dt>Receiver</dt><dd>{payment.receiverEmail}</dd>
          </dl>

          <div style={{ marginTop: 18 }}>
            <button className="btn btn-primary" onClick={() => nav('/')}>Return home</button>
          </div>
        </div>
      )}
    </div>
  );
}