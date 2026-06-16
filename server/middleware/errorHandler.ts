export function errorHandlerMiddleware(err: Error, _req: any, res: any, _next: (err?: Error) => void) {
  console.error('[ERROR]', err.message, err.stack);
  const statusCode = (err as any).statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: {
      code: statusCode === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    },
  });
}
