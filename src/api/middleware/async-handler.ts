import type { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncRouteHandler<RequestParams, RequestBody> = (
  req: Request<RequestParams, unknown, RequestBody>,
  res: Response<unknown>,
  next: NextFunction,
) => Promise<void>;

// Express 4 does not automatically send rejected promises to its error handler.
// Keep the request's types and pass a failed controller call to next(error).
export const asyncHandler = <RequestParams, RequestBody>(
  handler: AsyncRouteHandler<RequestParams, RequestBody>,
): RequestHandler<RequestParams, unknown, RequestBody> => {
  return (req, res, next): void => {
    void Promise.resolve()
      .then(() => handler(req, res, next))
      .catch((error: unknown) => {
        // JavaScript can reject with any value. Express treats some values,
        // such as undefined or "route", as instructions rather than errors.
        next(
          error instanceof Error
            ? error
            : new Error('Unexpected asynchronous error'),
        );
      });
  };
};
