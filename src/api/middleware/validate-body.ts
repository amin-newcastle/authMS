import type { RequestHandler } from 'express';
import type { z } from 'zod';

// Middleware is a step that runs before a controller handles a request.
// This step checks req.body, which contains the data sent by the client.
// Schema lets us reuse this function with different checklists; z.output<Schema>
// tells TypeScript what the data looks like after Zod checks and cleans it.
export const validateBody = <Schema extends z.ZodType>(
  schema: Schema,
): RequestHandler<unknown, unknown, z.output<Schema>> => {
  return (req, res, next): void => {
    // safeParse checks the body and returns either checked data or a list of problems.
    // Bad input is an expected result here, so it does not throw an error.
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // 400 means the client sent invalid input. Say which fields need fixing,
      // but do not include the submitted username or password in the response.
      res.status(400).json({
        success: false,
        message: 'Invalid request body',
        errors: result.error.issues.map((issue) => ({
          // The path identifies the field, such as "username". An empty path
          // means the whole body is wrong, for example null instead of an object.
          field: issue.path.join('.') || 'body',
          message: issue.message,
        })),
      });
      // Sending a response does not stop the function. Return now so invalid
      // data cannot continue to the controller through next().
      return;
    }

    // Replace the original body with the checked data. The controller now gets
    // the trimmed registration username and no extra fields from the client.
    req.body = result.data;
    // next() tells Express to move on to the controller for this route.
    next();
  };
};
