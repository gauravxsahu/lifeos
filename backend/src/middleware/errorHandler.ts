import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { config } from '../config/env';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  // Log error (avoid logging passwords/tokens)
  if (statusCode >= 500) {
    console.error(`[UnhandledError] ${req.method} ${req.originalUrl}:`, err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      details: isAppError ? (err as AppError).details : undefined,
      ...(config.nodeEnv === 'development' && !isAppError ? { stack: err.stack } : {}),
    },
  });
};
