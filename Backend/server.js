require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const paymentRoutes = require('./routes/paymentRoutes');
const payfastRoutes = require('./routes/payfast');

const PORT = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Debug middleware for all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Body:', req.body);
  next();
});

// Routes
app.use('/api/payments', paymentRoutes);
app.use('/payfast', payfastRoutes);

// Test endpoint
app.get('/test', (req, res) => res.json({ message: 'Backend is running!' }));

// Catch-all for unknown routes
app.use((req, res) => {
  console.warn('Unknown route:', req.originalUrl);
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('💥 Global error:', err.stack || err);
  res.status(500).json({ 
    error: err.message,
    stack: err.stack // for debugging
  });
});


// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
