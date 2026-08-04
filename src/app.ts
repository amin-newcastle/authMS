import express, {
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import morgan from 'morgan';

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

app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1/auth', authRoutes);

app.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  },
);

export default app;
