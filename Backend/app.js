// Backend/app.js
// Import the Express framework to build the web server
const express = require('express');

// Import CORS middleware to allow cross-origin requests (e.g., React frontend calling Express backend)
const cors = require('cors');

// Import Helmet to set various secure HTTP headers automatically
const helmet = require('helmet');

// Import dotenv to load environment variables from a .env file into process.env
const dotenv = require('dotenv');

// Load environment variables (e.g., PORT, DB URI)
dotenv.config();

// Create an instance of an Express application
const app = express();

// Apply Helmet middleware to secure the app by setting HTTP headers (e.g., XSS, frameguard, HSTS)
app.use(helmet());

// Enable CORS so that requests from other origins (like the frontend) are allowed
app.use(cors());

// Enable Express to parse incoming JSON payloads (used in POST and PUT requests)
app.use(express.json());

// Define a simple route at the root URL to confirm the server is running
app.get('/', (req, res) => {
  res.send('Secure Blog API running!');
});

// Export the app so it can be used in server.js
module.exports = app;

app.get('/test', (req, res) => {
  res.json({ message: 'This is Secure Blog JSON response' });
});