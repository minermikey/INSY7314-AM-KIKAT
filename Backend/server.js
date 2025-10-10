// Backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const https = require('https');



const paymentRoutes = require('./routes/paymentRoutes');
const payfastRoutes = require('./routes/payfast');
const authRoutes = require("./routes/authRoutes"); 

const PORT = process.env.PORT || 5000;

const cert = process.env.SSL_CERT
const key = process.env.SSL_KEY

const options = {
  key: key,
  cert: cert,
};

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
https.createServer(options, app).listen(PORT, () => {
  console.log(`Secure API running at https://localhost:${PORT}`);
});