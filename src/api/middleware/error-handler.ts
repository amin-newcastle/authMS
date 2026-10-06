import type { ErrorRequestHandler } from 'express';
import jwt from 'jsonwebtoken';

import { AppError } from '../errors/app.error.js';

// The four parameters tell Express this function handles errors.
// Register it last so failed requests from earlier steps can reach it.
export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  next,
): void => {
  // Once a response has started, Express must finish handling the error.
  // Trying to send another JSON response would fail with "headers already sent".
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  // Broken JSON fails before the route's field checks. Keep the same safe 400
  // response and never include the original body, which may contain a password.
  if (
    error instanceof SyntaxError &&
    'type' in error &&
    error.type === 'entity.parse.failed' &&
    'status' in error &&
    error.status === 400
  ) {
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

  // Invalid, expired, and not-yet-valid JWTs share this error type.
  // Use a fixed message rather than exposing the library's error details.
  if (error instanceof jwt.JsonWebTokenError) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
    return;
  }

  // Unexpected failures may contain database details or secrets in their messages.
  // Only send a fixed response; do not echo or log the raw error here.
  res.status(500).json({ success: false, message: 'Internal Server Error' });
};
