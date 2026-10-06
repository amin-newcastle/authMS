// Use this for an expected failure whose message is safe to show to the client.
// The status code tells the central error handler how to respond.
export class AppError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}
