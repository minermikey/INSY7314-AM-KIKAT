// src/pages/PaymentSuccess.jsx
export default function PaymentSuccess() {
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>✅ Payment Successful!</h1>
      <p>Thank you! Your payment was processed successfully.</p>
      <a href="/payments" className="btn btn-primary">Back to Payments</a>
    </div>
  );
}
