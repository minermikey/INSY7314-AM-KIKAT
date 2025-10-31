// frontend/src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Home Page</h1>
      <Link to="/payment">
        <button style={{ padding: 10, fontSize: 16 }}>Go to Payment Page</button>
      </Link>
    </div>
  );
}
