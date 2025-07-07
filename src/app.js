const express = require('express');
const bodyParser = require('body-parser');
// Import route (Controller layer entry point)
const authRoutes = require('./api/routes/auth.routes.js');

// Create an Express application instance
const app = express();

// Define a basic health check or landing route
app.get('/', (req, res) => {
  res.send('Hello world!');
});

// Middleware:
// Parses JSON bodies and attaches the result to req.body
app.use(bodyParser.json());
// Global error handler for HTTP request/response
app.use((error, req, res, next) => {
  res.status(500).json({ message: error.message });
});

// Mount Routes (entry point into the Controller layer)
app.use('/api/v1/auth', authRoutes);

// Export the configured app instance (to be used in the main server file or tests)
module.exports = app;
