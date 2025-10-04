// Import Mongoose to connect to MongoDB (used later for database operations)
const mongoose = require('mongoose');

// Import the Express app defined in app.js
const app = require('./app');

// Load environment variables (again, in case they're needed here too)
require('dotenv').config();

// Define the server port, using the environment variable if available, or default to 5000
const PORT = process.env.PORT || 5000;

// Start the Express server and listen on the defined port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});