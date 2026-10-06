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

// Turn the JSON text sent by the client into a JavaScript value in req.body.
// If the JSON is broken (for example, a missing closing brace), Express sends
// the error to the handler below before the request reaches a route.
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1/auth', authRoutes);

// The four parameters tell Express this function handles errors.
// Place it after the routes so errors from earlier steps can reach it.
app.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    // These checks identify an error caused by broken JSON in a request.
    // Other errors should reach the general server-error response below.
    if (
      err instanceof SyntaxError &&
      'type' in err &&
      err.type === 'entity.parse.failed' &&
      'status' in err &&
      err.status === 400
    ) {
      // Send the same error format used for failed field checks.
      // Do not send back the broken JSON, because it could contain a password.
      res.status(400).json({
        success: false,
        message: 'Invalid request body',
        errors: [
          {
            field: 'body',
            message: 'Request body must be a valid JSON object',
          },
        ],
      });
      return;
    }

    res.status(500).json({ message: err.message || 'Internal Server Error' });
  },
);

export default app;
