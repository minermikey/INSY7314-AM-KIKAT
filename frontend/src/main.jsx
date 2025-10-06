// main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import PaymentPage from './pages/PaymentPage.jsx'; // your payment page
import HomePage from './pages/HomePage.jsx'; // create a simple HomePage

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/payment" element={<PaymentPage />} />
        {/* Add more routes here if needed */}
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
