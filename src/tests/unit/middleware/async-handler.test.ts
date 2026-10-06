import { describe, expect, it, jest } from '@jest/globals';
import type { NextFunction, Request, Response } from 'express';
import httpMocks from 'node-mocks-http';

import { asyncHandler } from '../../../api/middleware/async-handler.ts';

describe('asyncHandler', () => {
  it('lets a successful controller send its response', async () => {
    const req = httpMocks.createRequest<Request>();
    const res = httpMocks.createResponse<Response>();
    const next = jest.fn<NextFunction>();
    const completed = new Promise<void>((resolve) => {
      const handler = asyncHandler(async (_req, response): Promise<void> => {
        response.status(200).json({ success: true });
        resolve();
      });
      handler(req, res, next);
    });

    await completed;

    expect(res._getJSONData()).toEqual({ success: true });
    expect(next).not.toHaveBeenCalled();
  });

  it('forwards the original Error to Express exactly once', async () => {
    const req = httpMocks.createRequest<Request>();
    const res = httpMocks.createResponse<Response>();
    const next = jest.fn<NextFunction>();
    const forwarded = new Promise<void>((resolve) => {
      next.mockImplementation(() => {
        resolve();
      });
    });
    const error = new Error('Database connection failed');
    const handler = asyncHandler(async (): Promise<void> => {
      throw error;
    });

    handler(req, res, next);
    await forwarded;

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);
    expect(res._isEndCalled()).toBe(false);
  });

  it.each([
    undefined,
    null,
    false,
    0,
    '',
    'route',
    'router',
    'private failure',
  ])(
    'converts a rejected %p value into an Error instead of Express control flow',
    async (rejection) => {
      const req = httpMocks.createRequest<Request>();
      const res = httpMocks.createResponse<Response>();
      const next = jest.fn<NextFunction>();
      const forwarded = new Promise<void>((resolve) => {
        next.mockImplementation(() => {
          resolve();
        });
      });
      const handler = asyncHandler(async (): Promise<void> => {
        throw rejection;
      });

      handler(req, res, next);
      await forwarded;

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res._isEndCalled()).toBe(false);
    },
  );
});
