// Backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');



const paymentRoutes = require('./routes/paymentRoutes');
const payfastRoutes = require('./routes/payfast');
const authRoutes = require("./routes/authRoutes"); 

const PORT = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(cors({
  origin: 'https://localhost:5173',
  credentials: true
}));app.use(express.json());

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/payments', paymentRoutes);
app.use('/payfast', payfastRoutes);
app.use("/api/auth", authRoutes);

app.get('/test', (req, res) => res.json({ message: 'Backend is running!' }));

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
