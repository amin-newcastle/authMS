import bodyParser from 'body-parser';
import express from 'express';
import morgan from 'morgan';

// Import route (Controller layer entry point)
import authRoutes from './api/routes/auth.routes.js';

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
app.use((error, req, res) => {
  res.status(500).json({ message: error.message });
});
// Dev logger middleware for logging HTTP requests
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount Routes (entry point into the Controller layer)
app.use('/api/v1/auth', authRoutes);

// Export the configured app instance (to be used in the main server file or tests)
export default app;
