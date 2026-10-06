import express from 'express';
import morgan from 'morgan';

import { errorHandler } from './api/middleware/error-handler.js';
import authRoutes from './api/routes/auth.routes.js';

const app = express();

// Health check route for monitoring and Docker readiness probes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'authms' });
});

// Root route kept for a simple browser smoke test during local development
app.get('/', (req, res) => {
  res.send('Hello world!');
});

// Turn the JSON text sent by the client into a JavaScript value in req.body.
// If the JSON is broken (for example, a missing closing brace), Express sends
// the error to the handler below before the request reaches a route.
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1/auth', authRoutes);

// Keep this last so errors from the JSON parser, routes, and services reach it.
app.use(errorHandler);

export default app;
