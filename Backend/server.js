// Import Mongoose to connect to MongoDB (used later for database operations)
const mongoose = require('mongoose');
const https = require('https');
const fs = require('fs');

// Import the Express app defined in app.js
const app = require('./app');

// Load environment variables (again, in case they're needed here too)
require('dotenv').config();

// Define the server port, using the environment variable if available, or default to 5000
const PORT = process.env.PORT || 5000;

const options = {
  key: fs.readFileSync('ssl/privatekey.pem'),
  cert: fs.readFileSync('ssl/certificate.pem')
}

// Start the Express server and listen on the defined port
https.createServer(options, app).listen(PORT, () => {
  console.log(`Secure API running at https://localhost:${PORT}`);
});