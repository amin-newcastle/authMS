import { describe, expect, it, jest } from '@jest/globals';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import httpMocks from 'node-mocks-http';

import { AppError } from '../../../api/errors/app.error.ts';
import { errorHandler } from '../../../api/middleware/error-handler.ts';

describe('errorHandler', () => {
  it.each([
    ['User already exists', 409],
    ['Invalid username or password', 401],
  ])('uses the application error message and status: %s', (message, status) => {
    const req = httpMocks.createRequest<Request>();
    const res = httpMocks.createResponse<Response>();
    const next = jest.fn<NextFunction>();

    errorHandler(new AppError(message, status), req, res, next);

    expect(res.statusCode).toBe(status);
    expect(res._getJSONData()).toEqual({ success: false, message });
    expect(next).not.toHaveBeenCalled();
  });

  it.each([
    new Error('Database password: private-secret'),
    'private thrown string',
    { message: 'private detail', statusCode: 401 },
    null,
    undefined,
    false,
    0,
  ])('returns a safe 500 response for an unexpected %p error', (error) => {
    const req = httpMocks.createRequest<Request>();
    const res = httpMocks.createResponse<Response>();
    const next = jest.fn<NextFunction>();

    errorHandler(error, req, res, next);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({
      success: false,
      message: 'Internal Server Error',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it.each([
    new jwt.JsonWebTokenError('invalid signature'),
    new jwt.TokenExpiredError('jwt expired', new Date(0)),
    new jwt.NotBeforeError('jwt not active', new Date(0)),
  ])('returns the same safe 401 response for %p', (error) => {
    const req = httpMocks.createRequest<Request>();
    const res = httpMocks.createResponse<Response>();
    const next = jest.fn<NextFunction>();

    errorHandler(error, req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res._getJSONData()).toEqual({
      success: false,
      message: 'Invalid or expired token',
    });
  });

  it('preserves the existing validation response for malformed JSON', () => {
    const req = httpMocks.createRequest<Request>();
    const res = httpMocks.createResponse<Response>();
    const next = jest.fn<NextFunction>();
    const error = Object.assign(new SyntaxError('private submitted JSON'), {
      status: 400,
      type: 'entity.parse.failed',
      body: '{"password":"private-secret"',
    });

    errorHandler(error, req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      success: false,
      message: 'Invalid request body',
      errors: [
        {
          field: 'body',
          message: 'Request body must be a valid JSON object',
        },
      ],
    });
  });

  it('treats an unrelated SyntaxError as an unexpected server error', () => {
    const req = httpMocks.createRequest<Request>();
    const res = httpMocks.createResponse<Response>();
    const next = jest.fn<NextFunction>();

    errorHandler(new SyntaxError('private application bug'), req, res, next);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({
      success: false,
      message: 'Internal Server Error',
    });
  });

  it('delegates to Express when the response has already started', () => {
    const req = httpMocks.createRequest<Request>();
    const res = httpMocks.createResponse<Response>();
    const next = jest.fn<NextFunction>();
    const error = new Error('failure after sending a response');
    res.status(200).json({ success: true });

    errorHandler(error, req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ success: true });
  });
});
