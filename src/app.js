const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./api/routes/auth.routes.js');

const app = express();

app.get('/', (req, res) => {
  res.send('Hello world!');
});

// Middleware
app.use(bodyParser.json());
app.use((error, req, res, next) => {
  res.status(500).json({ message: error.message });
});

// Routes
app.use('/api/v1/auth', authRoutes);

module.exports = app; // Export app instead of running it here
