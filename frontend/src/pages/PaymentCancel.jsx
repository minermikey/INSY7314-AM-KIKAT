// src/pages/PaymentCancel.jsx
export default function PaymentCancel() {
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>❌ Payment Cancelled</h1>
      <p>Your payment was cancelled. Please try again later.</p>
      <a href="/payments" className="btn btn-primary">Back to Payments</a>
    </div>
  );
}
