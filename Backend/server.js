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

// Routes
app.use('/api/payments', paymentRoutes);
app.use('/payfast', payfastRoutes);

app.get('/test', (req, res) => res.json({ message: 'Backend is running!' }));

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
