// frontend/src/components/PayFastButton.jsx
import React from 'react';

export default function PayFastButton() {
  const handlePayFast = async () => {
    try {
      const res = await fetch('http://localhost:5000/payfast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 100,
          item_name: 'Test Payment',
          buyer_email: 'buyer@sandbox.com',
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to PayFast sandbox
      } else {
        alert('Failed to get PayFast URL');
      }
    } catch (err) {
      console.error('PayFast error:', err);
      alert('Error connecting to PayFast');
    }
  };

  return (
    <button
      onClick={handlePayFast}
      style={{
        padding: '10px 20px',
        backgroundColor: '#ff6600',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
      }}
    >
      Pay with PayFast (Sandbox)
    </button>
  );
}
